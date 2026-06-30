const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const User = require('../models/User');
const Order = require('../models/Order');
const Wallet = require('../models/Wallet');
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Get dashboard stats
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const totalOrders = await Order.countDocuments();
    const completedOrders = await Order.countDocuments({ status: 'completed' });
    const totalSpent = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$totalSpent' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalOrders,
        completedOrders,
        totalRevenue: totalSpent[0]?.total || 0,
        conversionRate: ((completedOrders / totalOrders) * 100).toFixed(2),
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all users
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'all' } = req.query;
    const query = status !== 'all' ? { status } : {};

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
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

// Get user details
router.get('/users/:userId', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    const wallet = await Wallet.findOne({ userId: req.params.userId });
    const orders = await Order.find({ userId: req.params.userId });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user,
      wallet,
      orderCount: orders.length,
      orders: orders.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Suspend user
router.post('/users/:userId/suspend', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { status: 'suspended' },
      { new: true }
    ).select('-password');

    // Log the action
    await AuditLog.create({
      userId: req.user.id,
      action: 'suspend_user',
      target: req.params.userId,
      status: 'success'
    });

    res.json({
      success: true,
      message: 'User suspended successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Activate user
router.post('/users/:userId/activate', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { status: 'active' },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'User activated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all orders
router.get('/orders', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'all' } = req.query;
    const query = status !== 'all' ? { status } : {};

    const orders = await Order.find(query)
      .populate('userId', 'username email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
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

// Update order status
router.put('/orders/:orderId', auth, adminAuth, async (req, res) => {
  try {
    const { status, progress } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status, progress },
      { new: true }
    );

    // Log the action
    await AuditLog.create({
      userId: req.user.id,
      action: 'update_order',
      target: req.params.orderId,
      details: { status, progress },
      status: 'success'
    });

    res.json({
      success: true,
      message: 'Order updated successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get audit logs
router.get('/audit-logs', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, action = 'all' } = req.query;
    const query = action !== 'all' ? { action } : {};

    const logs = await AuditLog.find(query)
      .populate('userId', 'username')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await AuditLog.countDocuments(query);

    res.json({
      success: true,
      logs,
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

// Delete user (soft delete - set to inactive)
router.delete('/users/:userId', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { status: 'inactive' },
      { new: true }
    ).select('-password');

    // Log the action
    await AuditLog.create({
      userId: req.user.id,
      action: 'delete_user',
      target: req.params.userId,
      status: 'success'
    });

    res.json({
      success: true,
      message: 'User deleted successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
