const mongoose = require('mongoose');

const systemStatsSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
    unique: true
  },
  totalUsers: Number,
  activeUsers: Number,
  totalOrders: Number,
  completedOrders: Number,
  totalRevenue: Number,
  averageOrderValue: Number,
  topService: String,
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SystemStats', systemStatsSchema);
