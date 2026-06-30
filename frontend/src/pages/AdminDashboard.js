import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiShoppingCart, FiDollarSign, FiTrendingUp, FiLogOut } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../utils/api';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data.stats);
      } catch (error) {
        toast.error('Failed to load admin stats');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <AdminNavbar />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <h1 className="text-4xl font-bold text-white mb-8">Admin Dashboard</h1>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Users */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-white mt-2">{stats?.totalUsers}</p>
                </div>
                <div className="bg-blue-600/20 p-4 rounded-lg">
                  <FiUsers className="text-blue-400 text-3xl" />
                </div>
              </div>
            </div>

            {/* Active Users */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-green-500 transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Users</p>
                  <p className="text-3xl font-bold text-green-400 mt-2">{stats?.activeUsers}</p>
                </div>
                <div className="bg-green-600/20 p-4 rounded-lg">
                  <FiTrendingUp className="text-green-400 text-3xl" />
                </div>
              </div>
            </div>

            {/* Total Orders */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-purple-500 transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Orders</p>
                  <p className="text-3xl font-bold text-purple-400 mt-2">{stats?.totalOrders}</p>
                </div>
                <div className="bg-purple-600/20 p-4 rounded-lg">
                  <FiShoppingCart className="text-purple-400 text-3xl" />
                </div>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-orange-500 transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Revenue</p>
                  <p className="text-3xl font-bold text-orange-400 mt-2">${stats?.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-orange-600/20 p-4 rounded-lg">
                  <FiDollarSign className="text-orange-400 text-3xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Completed Orders */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">Completion Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-slate-400">Completed Orders</p>
                  <p className="text-2xl font-bold text-green-400">{stats?.completedOrders}</p>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${((stats?.completedOrders / stats?.totalOrders) * 100) || 0}%`
                    }}
                  />
                </div>
                <p className="text-slate-400 text-sm">Conversion Rate: {stats?.conversionRate}%</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <a
                  href="/admin/users"
                  className="block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-center transition"
                >
                  👥 Manage Users
                </a>
                <a
                  href="/admin/orders"
                  className="block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg text-center transition"
                >
                  📦 Manage Orders
                </a>
                <a
                  href="/admin/audit-logs"
                  className="block bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg text-center transition"
                >
                  📋 Audit Logs
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
