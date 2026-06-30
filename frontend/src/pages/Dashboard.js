import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { FiDollarSign, FiShoppingCart, FiTrendingUp, FiArrowRight } from 'react-icons/fi';
import { getUserProfile, getWalletBalance, getOrders } from '../utils/api';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, walletRes, ordersRes] = await Promise.all([
          getUserProfile(),
          getWalletBalance(),
          getOrders(),
        ]);
        setUser(userRes.data.user);
        setWallet(walletRes.data);
        setOrders(ordersRes.data.orders.slice(0, 5));
      } catch (error) {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
          <h1 className="text-3xl font-bold text-white mb-8">Welcome, {user?.username}!</h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Wallet Balance */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Wallet Balance</p>
                  <p className="text-2xl font-bold text-white mt-2">${wallet?.balance.toFixed(2)}</p>
                </div>
                <div className="bg-blue-600/20 p-3 rounded-lg">
                  <FiDollarSign className="text-blue-400 text-2xl" />
                </div>
              </div>
            </div>

            {/* Total Orders */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Orders</p>
                  <p className="text-2xl font-bold text-white mt-2">{user?.totalOrders}</p>
                </div>
                <div className="bg-purple-600/20 p-3 rounded-lg">
                  <FiShoppingCart className="text-purple-400 text-2xl" />
                </div>
              </div>
            </div>

            {/* Total Spent */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Spent</p>
                  <p className="text-2xl font-bold text-white mt-2">${user?.totalSpent.toFixed(2)}</p>
                </div>
                <div className="bg-green-600/20 p-3 rounded-lg">
                  <FiTrendingUp className="text-green-400 text-2xl" />
                </div>
              </div>
            </div>

            {/* Deposited */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Deposited</p>
                  <p className="text-2xl font-bold text-white mt-2">${wallet?.totalDeposited.toFixed(2)}</p>
                </div>
                <div className="bg-orange-600/20 p-3 rounded-lg">
                  <FiArrowRight className="text-orange-400 text-2xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link
              to="/create-order"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 rounded-lg text-center transition transform hover:scale-105"
            >
              + Create New Order
            </Link>
            <Link
              to="/wallet"
              className="bg-slate-800 border border-slate-700 hover:border-slate-600 text-white font-semibold py-4 rounded-lg text-center transition"
            >
              💰 Top Up Wallet
            </Link>
          </div>

          {/* Recent Orders */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Recent Orders</h2>
              <Link to="/orders" className="text-blue-400 hover:text-blue-300">
                View All
              </Link>
            </div>
            {orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 text-slate-400 font-semibold">Service</th>
                      <th className="text-left py-3 text-slate-400 font-semibold">Quantity</th>
                      <th className="text-left py-3 text-slate-400 font-semibold">Cost</th>
                      <th className="text-left py-3 text-slate-400 font-semibold">Status</th>
                      <th className="text-left py-3 text-slate-400 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id} className="border-b border-slate-700 hover:bg-slate-700/50">
                        <td className="py-3 text-white">{order.serviceName}</td>
                        <td className="py-3 text-white">{order.quantity}</td>
                        <td className="py-3 text-white">${order.totalCost.toFixed(2)}</td>
                        <td className="py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.status === 'completed' ? 'bg-green-600/20 text-green-400' :
                            order.status === 'processing' ? 'bg-blue-600/20 text-blue-400' :
                            'bg-yellow-600/20 text-yellow-400'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 text-slate-400 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">No orders yet. Create your first order!</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
