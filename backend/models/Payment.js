const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  phoneNumber: {
    type: String,
    required: true
  },
  transactionType: {
    type: String,
    enum: ['deposit', 'order'],
    default: 'deposit'
  },
  checkoutRequestID: String,
  merchantRequestID: String,
  resultCode: String,
  resultDesc: String,
  mpesaReceiptNumber: String,
  transactionDate: Date,
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    default: 'mpesa'
  },
  reference: String,
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Payment', paymentSchema);
