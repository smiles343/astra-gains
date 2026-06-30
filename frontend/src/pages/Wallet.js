import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { FiDollarSign, FiPlus, FiMinus, FiLoader } from 'react-icons/fi';
import { getWalletBalance, getTransactions, depositFunds, withdrawFunds } from '../utils/api';
import { toast } from 'react-toastify';

const Wallet = () => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [action, setAction] = useState('deposit');

  useEffect(() => {
    fetchWalletData();
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

  const handleAction = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setActionLoading(true);
    try {
      if (action === 'deposit') {
        await depositFunds(parseFloat(amount));
        toast.success('Deposit successful!');
      } else {
        await withdrawFunds(parseFloat(amount));
        toast.success('Withdrawal request submitted!');
      }
      setAmount('');
      fetchWalletData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
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

          {/* Deposit/Withdraw Form */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 mb-8 max-w-md">
            <form onSubmit={handleAction} className="space-y-4">
              {/* Action Toggle */}
              <div className="flex space-x-4 mb-6">
                <button
                  type="button"
                  onClick={() => setAction('deposit')}
                  className={`flex-1 py-2 rounded-lg font-semibold transition ${
                    action === 'deposit'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <FiPlus className="inline mr-2" /> Deposit
                </button>
                <button
                  type="button"
                  onClick={() => setAction('withdraw')}
                  className={`flex-1 py-2 rounded-lg font-semibold transition ${
                    action === 'withdraw'
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <FiMinus className="inline mr-2" /> Withdraw
                </button>
              </div>

              {/* Amount Input */}
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={actionLoading}
                className={`w-full text-white font-semibold py-2 rounded-lg transition flex items-center justify-center space-x-2 disabled:opacity-50 ${
                  action === 'deposit'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {actionLoading && <FiLoader className="animate-spin" />}
                <span>{actionLoading ? 'Processing...' : `${action.charAt(0).toUpperCase() + action.slice(1)}`}</span>
              </button>
            </form>
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
