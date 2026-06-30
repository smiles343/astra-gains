const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendEmail } = require('../utils/emailService');

// Create manual M-Pesa payment request
router.post('/manual-payment', auth, async (req, res) => {
  try {
    const { amount, phoneNumber, reference } = req.body;

    if (!amount || !phoneNumber) {
      return res.status(400).json({ success: false, message: 'Amount and phone number required' });
    }

    if (amount < 1) {
      return res.status(400).json({ success: false, message: 'Minimum amount is 1 KSh' });
    }

    // Get user
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
      status: 'pending',
      description: `M-Pesa Deposit - ${amount} KSh`,
      reference: reference || `PAY-${req.user.id}-${Date.now()}`,
      paymentMethod: 'mpesa_manual',
    });
    await payment.save();

    res.status(201).json({
      success: true,
      message: 'Payment request created. Send M-Pesa payment now.',
      payment: {
        _id: payment._id,
        amount: payment.amount,
        phoneNumber: '254797856232', // ASTRA GAINS number
        reference: payment.reference,
        status: payment.status,
        instructions: `Send ${amount} KSh to 174379 with reference: ${payment.reference}`,
      }
    });
  } catch (error) {
    console.error('Payment Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get pending payments
router.get('/pending', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.id, status: 'pending' })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      payments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get payment history
router.get('/history', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      payments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Verify/Approve payment
router.post('/verify/:paymentId', auth, async (req, res) => {
  try {
    const { mpesaReceiptNumber } = req.body;

    // Check if admin
    const admin = await User.findById(req.user.id);
    if (!admin?.isAdmin) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    payment.status = 'success';
    payment.mpesaReceiptNumber = mpesaReceiptNumber;
    payment.transactionDate = new Date();
    await payment.save();

    // Add funds to wallet
    const wallet = await Wallet.findOne({ userId: payment.userId });
    if (wallet) {
      wallet.balance += payment.amount;
      wallet.totalDeposited += payment.amount;
      wallet.transactions.push({
        type: 'deposit',
        amount: payment.amount,
        description: `M-Pesa Deposit - Receipt: ${mpesaReceiptNumber}`,
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
    }

    res.json({
      success: true,
      message: 'Payment verified and wallet updated',
      payment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Reject payment
router.post('/reject/:paymentId', auth, async (req, res) => {
  try {
    const { reason } = req.body;

    // Check if admin
    const admin = await User.findById(req.user.id);
    if (!admin?.isAdmin) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const payment = await Payment.findByIdAndUpdate(
      req.params.paymentId,
      { status: 'failed', resultDesc: reason || 'Rejected by admin' },
      { new: true }
    );

    // Send rejection email
    const user = await User.findById(payment.userId);
    await sendEmail(
      user.email,
      'paymentRejected',
      user.username,
      payment.amount,
      reason || 'Your payment was rejected. Please try again.'
    );

    res.json({
      success: true,
      message: 'Payment rejected',
      payment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get all pending payments
router.get('/admin/pending', auth, async (req, res) => {
  try {
    // Check if admin
    const admin = await User.findById(req.user.id);
    if (!admin?.isAdmin) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { page = 1, limit = 20 } = req.query;

    const payments = await Payment.find({ status: 'pending' })
      .populate('userId', 'username email phoneNumber')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Payment.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      payments,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
