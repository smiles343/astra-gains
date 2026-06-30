import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { FiDollarSign, FiPlus, FiMinus, FiLoader, FiX, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { getWalletBalance, getTransactions, withdrawFunds } from '../utils/api';
import { toast } from 'react-toastify';
import api from '../utils/api';
import MpesaPayment from '../components/MpesaPayment';

const Wallet = () => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [showMpesa, setShowMpesa] = useState(false);
  const [pendingPayments, setPendingPayments] = useState([]);

  useEffect(() => {
    fetchWalletData();
    fetchPendingPayments();
  }, []);

  const fetchWalletData = async () => {
    try {
      const [walletRes, transRes] = await Promise.all([
        getWalletBalance(),
        getTransactions(),
      ]);
      setWallet(walletRes.data);
      setTransactions(transRes.data.transactions);
    } catch (error) {
      toast.error('Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingPayments = async () => {
    try {
      const response = await api.get('/payment/pending');
      if (response.data.success) {
        setPendingPayments(response.data.payments);
      }
    } catch (error) {
      console.error('Failed to fetch pending payments');
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setActionLoading(true);
    try {
      await withdrawFunds(parseFloat(amount));
      toast.success('Withdrawal request submitted!');
      setAmount('');
      fetchWalletData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Withdrawal failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-white mb-8">Wallet Management</h1>

          {/* Wallet Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Current Balance */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <p className="text-slate-400 text-sm">Current Balance</p>
              <p className="text-3xl font-bold text-white mt-2">${wallet?.balance.toFixed(2)}</p>
            </div>

            {/* Total Deposited */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <p className="text-slate-400 text-sm">Total Deposited</p>
              <p className="text-3xl font-bold text-green-400 mt-2">${wallet?.totalDeposited.toFixed(2)}</p>
            </div>

            {/* Total Withdrawn */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <p className="text-slate-400 text-sm">Total Withdrawn</p>
              <p className="text-3xl font-bold text-red-400 mt-2">${wallet?.totalWithdrawn.toFixed(2)}</p>
            </div>
          </div>

          {/* Pending Payments Alert */}
          {pendingPayments.length > 0 && (
            <div className="bg-yellow-600/20 border border-yellow-600/50 rounded-lg p-4 mb-8 flex space-x-3">
              <FiAlertCircle className="text-yellow-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-yellow-300 font-semibold">Pending Payments</p>
                <p className="text-slate-300 text-sm mt-1">You have {pendingPayments.length} pending payment(s). Check your email for payment instructions.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* M-Pesa Deposit */}
            <div>
              <button
                onClick={() => setShowMpesa(true)}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 rounded-lg transition flex items-center justify-center space-x-2"
              >
                <FiPlus /> <span>M-Pesa Deposit</span>
              </button>

              {showMpesa && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-slate-900 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto relative">
                    <button
                      onClick={() => setShowMpesa(false)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-white z-10"
                    >
                      <FiX size={24} />
                    </button>
                    <div className="p-8">
                      <MpesaPayment
                        onSuccess={fetchWalletData}
                        onClose={() => setShowMpesa(false)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Withdrawal Form */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 lg:col-span-2">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                <FiMinus /> <span>Request Withdrawal</span>
              </h3>
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Amount ($)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="1"
                    step="0.01"
                    required
                    className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {actionLoading && <FiLoader className="animate-spin" />}
                  <span>{actionLoading ? 'Processing...' : 'Request Withdrawal'}</span>
                </button>
              </form>
              <p className="text-slate-400 text-xs mt-4">Withdrawals are typically processed within 24-48 hours</p>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6">Transaction History</h2>
            {transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 text-slate-400 font-semibold">Type</th>
                      <th className="text-left py-3 text-slate-400 font-semibold">Amount</th>
                      <th className="text-left py-3 text-slate-400 font-semibold">Description</th>
                      <th className="text-left py-3 text-slate-400 font-semibold">Status</th>
                      <th className="text-left py-3 text-slate-400 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((trans, idx) => (
                      <tr key={idx} className="border-b border-slate-700 hover:bg-slate-700/50">
                        <td className="py-3 text-white capitalize">{trans.type}</td>
                        <td className="py-3 text-white">${trans.amount.toFixed(2)}</td>
                        <td className="py-3 text-slate-400">{trans.description}</td>
                        <td className="py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            trans.status === 'completed' ? 'bg-green-600/20 text-green-400' :
                            trans.status === 'pending' ? 'bg-yellow-600/20 text-yellow-400' :
                            'bg-red-600/20 text-red-400'
                          }`}>
                            {trans.status}
                          </span>
                        </td>
                        <td className="py-3 text-slate-400 text-sm">{new Date(trans.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">No transactions yet</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Wallet;
