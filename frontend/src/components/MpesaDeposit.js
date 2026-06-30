import React, { useState } from 'react';
import { FiPhone, FiDollarSign, FiLoader, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../utils/api';

const MpesaDeposit = ({ onSuccess, onClose }) => {
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+254');
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [checkoutRequestID, setCheckoutRequestID] = useState(null);

  const handleSTKPush = async (e) => {
    e.preventDefault();

    if (!amount || amount < 1) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/mpesa/stk-push', {
        amount: parseInt(amount),
        phoneNumber,
      });

      if (response.data.success) {
        setPaymentStatus('prompt_sent');
        setPaymentId(response.data.paymentId);
        setCheckoutRequestID(response.data.checkoutRequestID);
        toast.success(response.data.customerMessage || 'STK Push sent! Check your phone.');

        // Start polling for payment status
        pollPaymentStatus(response.data.checkoutRequestID);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const pollPaymentStatus = async (checkoutID, attempts = 0) => {
    if (attempts > 30) {
      setPaymentStatus('timeout');
      toast.error('Payment check timed out. Please verify in your wallet.');
      return;
    }

    setTimeout(async () => {
      try {
        const response = await api.get(`/mpesa/stk-status/${checkoutID}`);

        if (response.data.success) {
          if (response.data.status === 'success') {
            setPaymentStatus('success');
            toast.success('Payment successful! Wallet updated.');
            setTimeout(() => {
              onSuccess();
              onClose();
            }, 2000);
          } else if (response.data.status === 'failed') {
            setPaymentStatus('failed');
            toast.error(`Payment failed: ${response.data.resultDesc}`);
          } else if (response.data.status === 'pending') {
            // Continue polling
            pollPaymentStatus(checkoutID, attempts + 1);
          }
        }
      } catch (error) {
        // Continue polling on error
        pollPaymentStatus(checkoutID, attempts + 1);
      }
    }, 2000);
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
      <h2 className="text-2xl font-bold text-white mb-6">M-Pesa Deposit</h2>

      {paymentStatus === null ? (
        <form onSubmit={handleSTKPush} className="space-y-6">
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
            <label className="block text-slate-300 text-sm font-medium mb-2">Phone Number</label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-3 text-slate-500" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+254797856232"
                required
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>
            <p className="text-slate-400 text-xs mt-1">Enter phone number in format: +254XXXXXXXXX or 0XXXXXXXXX</p>
          </div>

          {/* Merchant Info */}
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
            <p className="text-slate-300 text-sm">
              <strong>Business Name:</strong> ASTRA GAINS
            </p>
            <p className="text-slate-300 text-sm mt-1">
              <strong>Paybill:</strong> 174379
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading && <FiLoader className="animate-spin" />}
            <span>{loading ? 'Processing...' : 'Send M-Pesa Prompt'}</span>
          </button>
        </form>
      ) : paymentStatus === 'prompt_sent' ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="text-yellow-400 text-4xl" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Check Your Phone</h3>
          <p className="text-slate-400 mb-4">A prompt has been sent to your phone. Enter your M-Pesa PIN to complete the payment.</p>
          <p className="text-slate-300 text-sm">Amount: <strong>{amount} KSh</strong></p>
          <p className="text-slate-300 text-sm mt-2">Phone: <strong>{phoneNumber}</strong></p>
          <div className="mt-6 flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      ) : paymentStatus === 'success' ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheck className="text-green-400 text-4xl" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Payment Successful!</h3>
          <p className="text-slate-400 mb-4">Your wallet has been updated with {amount} KSh</p>
          <button
            onClick={onClose}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
          >
            Done
          </button>
        </div>
      ) : paymentStatus === 'failed' ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="text-red-400 text-4xl" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Payment Failed</h3>
          <p className="text-slate-400 mb-6">Your payment was not completed. Please try again.</p>
          <button
            onClick={() => setPaymentStatus(null)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="animate-spin inline-block">
            <FiLoader className="text-blue-400 text-4xl" />
          </div>
          <p className="text-slate-400 mt-4">Checking payment status...</p>
        </div>
      )}
    </div>
  );
};

export default MpesaDeposit;
