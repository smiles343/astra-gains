const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  action: {
    type: String,
    required: true,
    enum: ['login', 'logout', 'create_order', 'deposit', 'withdraw', 'delete_user', 'suspend_user', 'update_order']
  },
  target: {
    type: String,
    description: 'What was affected (user ID, order ID, etc.)'
  },
  details: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  status: {
    type: String,
    enum: ['success', 'failed'],
    default: 'success'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
