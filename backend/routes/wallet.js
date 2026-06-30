const express = require('express');
const router = express.Router();
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get wallet balance
router.get('/balance', auth, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user.id });
    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Wallet not found' });
    }

    res.json({
      success: true,
      balance: wallet.balance,
      totalDeposited: wallet.totalDeposited,
      totalWithdrawn: wallet.totalWithdrawn
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get wallet transactions
router.get('/transactions', auth, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user.id })
      .populate('transactions.orderId');

    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Wallet not found' });
    }

    const transactions = wallet.transactions.sort((a, b) => b.createdAt - a.createdAt);

    res.json({
      success: true,
      transactions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add funds to wallet (deposit)
router.post('/deposit', auth, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const wallet = await Wallet.findOne({ userId: req.user.id });
    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Wallet not found' });
    }

    wallet.balance += amount;
    wallet.totalDeposited += amount;
    wallet.transactions.push({
      type: 'deposit',
      amount,
      description: 'Wallet deposit',
      status: 'completed'
    });

    await wallet.save();

    res.json({
      success: true,
      message: 'Deposit successful',
      newBalance: wallet.balance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Withdraw from wallet
router.post('/withdraw', auth, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const wallet = await Wallet.findOne({ userId: req.user.id });
    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Wallet not found' });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    wallet.balance -= amount;
    wallet.totalWithdrawn += amount;
    wallet.transactions.push({
      type: 'withdrawal',
      amount,
      description: 'Wallet withdrawal',
      status: 'pending'
    });

    await wallet.save();

    res.json({
      success: true,
      message: 'Withdrawal request submitted',
      newBalance: wallet.balance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
