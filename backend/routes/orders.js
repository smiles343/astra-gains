const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const auth = require('../middleware/auth');
const cheapgainAPI = require('../utils/cheapgainAPI');

// Create order
router.post('/create', auth, async (req, res) => {
  try {
    const { serviceId, link, quantity } = req.body;

    if (!serviceId || !link || !quantity) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Get wallet
    const wallet = await Wallet.findOne({ userId: req.user.id });
    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Wallet not found' });
    }

    // Call CheapGainKenya API
    const apiResponse = await cheapgainAPI.createOrder(serviceId, link, quantity);
    
    if (!apiResponse.success) {
      return res.status(400).json({ success: false, message: apiResponse.message });
    }

    const totalCost = apiResponse.totalCost;

    // Check balance
    if (wallet.balance < totalCost) {
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
    }

    // Deduct from wallet
    wallet.balance -= totalCost;
    wallet.transactions.push({
      type: 'order',
      amount: totalCost,
      description: `Order for ${apiResponse.serviceName}`,
      status: 'completed'
    });
    await wallet.save();

    // Create order in database
    const order = new Order({
      userId: req.user.id,
      serviceId,
      serviceName: apiResponse.serviceName,
      link,
      quantity,
      rate: apiResponse.rate,
      totalCost,
      orderId: apiResponse.orderId,
      status: 'processing'
    });
    await order.save();

    // Update user stats
    const user = await User.findById(req.user.id);
    user.totalSpent += totalCost;
    user.totalOrders += 1;
    user.walletBalance = wallet.balance;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        _id: order._id,
        orderId: order.orderId,
        serviceName: order.serviceName,
        quantity: order.quantity,
        totalCost: order.totalCost,
        status: order.status
      },
      newBalance: wallet.balance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get order details
router.get('/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
