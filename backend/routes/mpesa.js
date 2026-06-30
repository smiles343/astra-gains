const express = require('express');
const router = express.Router();
const { initiateSTKPush, querySTKPushStatus } = require('../utils/mpesaService');
const Payment = require('../models/Payment');
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendEmail } = require('../utils/emailService');

// Initiate M-Pesa STK Push
router.post('/stk-push', auth, async (req, res) => {
  try {
    const { amount, phoneNumber } = req.body;

    if (!amount || !phoneNumber) {
      return res.status(400).json({ success: false, message: 'Amount and phone number required' });
    }

    if (amount < 1) {
      return res.status(400).json({ success: false, message: 'Minimum amount is 1 KSh' });
    }

    // Get user details
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Create payment record
    const payment = new Payment({
      userId: req.user.id,
      amount,
      phoneNumber,
      transactionType: 'deposit',
      description: `Astra Gains Wallet Deposit - ${amount} KSh`,
      reference: `DEPOSIT-${req.user.id}-${Date.now()}`,
    });
    await payment.save();

    // Initiate STK Push
    const stkResponse = await initiateSTKPush(
      phoneNumber,
      amount,
      `ASTRA-${payment._id}`,
      `Astra Gains Wallet Deposit`
    );

    if (!stkResponse.success) {
      payment.status = 'failed';
      payment.resultDesc = stkResponse.message;
      await payment.save();
      return res.status(400).json({ success: false, message: stkResponse.message });
    }

    // Update payment with checkout request ID
    payment.checkoutRequestID = stkResponse.checkoutRequestID;
    await payment.save();

    res.json({
      success: true,
      message: 'STK Push sent successfully. Please enter your M-Pesa PIN',
      paymentId: payment._id,
      checkoutRequestID: stkResponse.checkoutRequestID,
      responseCode: stkResponse.responseCode,
      customerMessage: stkResponse.customerMessage,
    });
  } catch (error) {
    console.error('STK Push Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Query STK Push Status
router.get('/stk-status/:checkoutRequestID', auth, async (req, res) => {
  try {
    const { checkoutRequestID } = req.params;

    const statusResponse = await querySTKPushStatus(checkoutRequestID);

    if (!statusResponse.success) {
      return res.status(400).json({ success: false, message: statusResponse.message });
    }

    // Update payment record
    const payment = await Payment.findOne({ checkoutRequestID });
    if (payment) {
      payment.resultCode = statusResponse.resultCode;
      payment.resultDesc = statusResponse.resultDesc;

      // If payment was successful (ResultCode 0)
      if (statusResponse.resultCode === '0') {
        payment.status = 'success';
        payment.mpesaReceiptNumber = statusResponse.data.MerchantRequestID;
        await payment.save();

        // Add funds to wallet
        const wallet = await Wallet.findOne({ userId: payment.userId });
        if (wallet) {
          wallet.balance += payment.amount;
          wallet.totalDeposited += payment.amount;
          wallet.transactions.push({
            type: 'deposit',
            amount: payment.amount,
            description: `M-Pesa Deposit - Receipt: ${statusResponse.data.MerchantRequestID}`,
            status: 'completed'
          });
          await wallet.save();

          // Update user wallet balance
          const user = await User.findByIdAndUpdate(
            payment.userId,
            { walletBalance: wallet.balance },
            { new: true }
          );

          // Send confirmation email
          await sendEmail(
            user.email,
            'depositConfirmation',
            user.username,
            payment.amount
          );
        }
      } else {
        payment.status = 'failed';
        await payment.save();
      }
    }

    res.json({
      success: true,
      status: payment?.status || 'unknown',
      resultCode: statusResponse.resultCode,
      resultDesc: statusResponse.resultDesc,
    });
  } catch (error) {
    console.error('Status Query Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// M-Pesa Callback (for server-to-server notifications)
router.post('/callback', async (req, res) => {
  try {
    const callbackData = req.body.Body.stkCallback;

    if (!callbackData) {
      return res.status(400).json({ success: false, message: 'Invalid callback data' });
    }

    const checkoutRequestID = callbackData.CheckoutRequestID;
    const resultCode = callbackData.ResultCode;
    const resultDesc = callbackData.ResultDesc;

    // Find payment
    const payment = await Payment.findOne({ checkoutRequestID });
    if (!payment) {
      return res.json({ success: true, message: 'Payment not found' });
    }

    payment.resultCode = resultCode;
    payment.resultDesc = resultDesc;

    // If successful (ResultCode 0)
    if (resultCode === 0) {
      const callbackMetadata = callbackData.CallbackMetadata.Item;
      const mpesaData = {};

      callbackMetadata.forEach(item => {
        mpesaData[item.Name] = item.Value;
      });

      payment.status = 'success';
      payment.mpesaReceiptNumber = mpesaData.MpesaReceiptNumber;
      payment.transactionDate = new Date(mpesaData.TransactionDate);
      await payment.save();

      // Add funds to wallet
      const wallet = await Wallet.findOne({ userId: payment.userId });
      if (wallet) {
        wallet.balance += payment.amount;
        wallet.totalDeposited += payment.amount;
        wallet.transactions.push({
          type: 'deposit',
          amount: payment.amount,
          description: `M-Pesa Deposit - Receipt: ${mpesaData.MpesaReceiptNumber}`,
          status: 'completed'
        });
        await wallet.save();

        // Update user
        const user = await User.findByIdAndUpdate(
          payment.userId,
          { walletBalance: wallet.balance },
          { new: true }
        );

        // Send confirmation email
        await sendEmail(
          user.email,
          'depositConfirmation',
          user.username,
          payment.amount
        );

        console.log(`✓ Payment ${payment._id} processed successfully`);
      }
    } else {
      payment.status = 'failed';
      await payment.save();
      console.log(`✗ Payment ${payment._id} failed: ${resultDesc}`);
    }

    res.json({ success: true, message: 'Callback processed' });
  } catch (error) {
    console.error('Callback Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get payment history
router.get('/history', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      payments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get payment details
router.get('/:paymentId', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (payment.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    res.json({
      success: true,
      payment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
