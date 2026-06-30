import React, { useState } from 'react';
import { FiPhone, FiDollarSign, FiLoader, FiCheck, FiAlertCircle, FiCopy } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../utils/api';

const MpesaPayment = ({ onSuccess, onClose }) => {
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+254797856232');
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentData, setPaymentData] = useState(null);

  const handleCreatePayment = async (e) => {
    e.preventDefault();

    if (!amount || amount < 1) {
      toast.error('Please enter a valid amount (minimum 1 KSh)');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/payment/manual-payment', {
        amount: parseInt(amount),
        phoneNumber,
      });

      if (response.data.success) {
        setPaymentStatus('created');
        setPaymentData(response.data.payment);
        toast.success('Payment request created!');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 w-full">
      <h2 className="text-2xl font-bold text-white mb-6">M-Pesa Payment</h2>

      {paymentStatus === null ? (
        <form onSubmit={handleCreatePayment} className="space-y-6">
          {/* Amount */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Amount (KSh)</label>
            <div className="relative">
              <FiDollarSign className="absolute left-3 top-3 text-slate-500" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
                max="150000"
                required
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>
            <p className="text-slate-400 text-xs mt-1">Min: 1 KSh | Max: 150,000 KSh</p>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Your Phone Number</label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-3 text-slate-500" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+254XXXXXXXXX"
                required
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>
            <p className="text-slate-400 text-xs mt-1">Format: +254XXXXXXXXX or 0XXXXXXXXX</p>
          </div>

          {/* Merchant Info */}
          <div className="bg-green-600/20 border border-green-600/50 rounded-lg p-4">
            <h3 className="text-green-400 font-semibold mb-3">📱 M-Pesa Payment Details</h3>
            <div className="space-y-2 text-sm">
              <p className="text-slate-300"><strong>Business Name:</strong> ASTRA GAINS</p>
              <p className="text-slate-300"><strong>Paybill Code:</strong> 174379</p>
              <p className="text-slate-300"><strong>Phone:</strong> +254797856232</p>
              <p className="text-slate-400 text-xs mt-3 italic">You will get a reference number after creating the request. Use it as your account reference in M-Pesa.</p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading && <FiLoader className="animate-spin" />}
            <span>{loading ? 'Creating Payment...' : 'Create Payment Request'}</span>
          </button>
        </form>
      ) : paymentStatus === 'created' ? (
        <div className="space-y-6">
          <div className="bg-blue-600/20 border border-blue-600/50 rounded-lg p-4">
            <h3 className="text-blue-400 font-semibold mb-3 flex items-center space-x-2">
              <FiCheck /> Payment Request Created
            </h3>
            <p className="text-slate-300 text-sm mb-4">Your payment request has been created. Please complete the M-Pesa payment using the details below:</p>
          </div>

          {/* Payment Details */}
          <div className="space-y-3">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-slate-400 text-xs mb-1">Amount</p>
              <p className="text-2xl font-bold text-white">{paymentData.amount} KSh</p>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-slate-400 text-xs mb-1">Reference Number</p>
              <div className="flex items-center justify-between">
                <p className="text-white font-mono text-sm">{paymentData.reference}</p>
                <button
                  onClick={() => copyToClipboard(paymentData.reference)}
                  className="text-blue-400 hover:text-blue-300 transition"
                >
                  <FiCopy size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3">📝 How to Pay via M-Pesa:</h4>
            <ol className="space-y-2 text-sm text-slate-300">
              <li className="flex">
                <span className="text-green-400 font-bold mr-3">1.</span>
                <span>Open M-Pesa on your phone</span>
              </li>
              <li className="flex">
                <span className="text-green-400 font-bold mr-3">2.</span>
                <span>Go to <strong>Lipa na M-Pesa Online</strong></span>
              </li>
              <li className="flex">
                <span className="text-green-400 font-bold mr-3">3.</span>
                <span>Enter Paybill: <strong>174379</strong></span>
              </li>
              <li className="flex">
                <span className="text-green-400 font-bold mr-3">4.</span>
                <span>Enter Account Reference: <strong>{paymentData.reference}</strong></span>
              </li>
              <li className="flex">
                <span className="text-green-400 font-bold mr-3">5.</span>
                <span>Enter Amount: <strong>{paymentData.amount}</strong></span>
              </li>
              <li className="flex">
                <span className="text-green-400 font-bold mr-3">6.</span>
                <span>Enter your M-Pesa PIN and submit</span>
              </li>
            </ol>
          </div>

          {/* Warning */}
          <div className="bg-yellow-600/20 border border-yellow-600/50 rounded-lg p-4 flex space-x-3">
            <FiAlertCircle className="text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <p className="text-yellow-300 text-sm font-semibold">Important</p>
              <p className="text-slate-300 text-xs mt-1">Make sure to use the exact reference number as your account reference in M-Pesa. This helps us verify your payment automatically.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setPaymentStatus(null);
                setPaymentData(null);
                setAmount('');
              }}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg transition"
            >
              Make Another Payment
            </button>
            <button
              onClick={() => {
                onSuccess();
                onClose();
              }}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MpesaPayment;
