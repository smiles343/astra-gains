import React, { useEffect, useState } from 'react';
import { FiSearch, FiFilter, FiCheck, FiX, FiLoader } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../utils/api';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [page, status]);

  const fetchUsers = async () => {
    try {
      const response = await api.get(`/admin/users?page=${page}&status=${status}&limit=10`);
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (userId) => {
    setActionLoading(userId);
    try {
      await api.post(`/admin/users/${userId}/suspend`);
      toast.success('User suspended');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to suspend user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (userId) => {
    setActionLoading(userId);
    try {
      await api.post(`/admin/users/${userId}/activate`);
      toast.success('User activated');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to activate user');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-white mb-8">Manage Users</h1>

          {/* Filters */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              {/* Search */}
              <div className="flex-1">
                <label className="block text-slate-300 text-sm font-medium mb-2">Search Users</label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by username or email..."
                    className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                  className="bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Users</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-4 px-6 text-slate-300 font-semibold">Username</th>
                    <th className="text-left py-4 px-6 text-slate-300 font-semibold">Email</th>
                    <th className="text-left py-4 px-6 text-slate-300 font-semibold">Status</th>
                    <th className="text-left py-4 px-6 text-slate-300 font-semibold">Joined</th>
                    <th className="text-left py-4 px-6 text-slate-300 font-semibold">Orders</th>
                    <th className="text-left py-4 px-6 text-slate-300 font-semibold">Spent</th>
                    <th className="text-left py-4 px-6 text-slate-300 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="border-b border-slate-700 hover:bg-slate-700/30 transition">
                      <td className="py-4 px-6 text-white font-medium">{user.username}</td>
                      <td className="py-4 px-6 text-slate-400 text-sm">{user.email}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.status === 'active' ? 'bg-green-600/20 text-green-400' :
                          user.status === 'suspended' ? 'bg-red-600/20 text-red-400' :
                          'bg-gray-600/20 text-gray-400'
                        }`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-400 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 px-6 text-white font-medium">{user.totalOrders}</td>
                      <td className="py-4 px-6 text-white font-medium">${user.totalSpent.toFixed(2)}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          {user.status === 'active' ? (
                            <button
                              onClick={() => handleSuspend(user._id)}
                              disabled={actionLoading === user._id}
                              className="bg-red-600/20 text-red-400 hover:bg-red-600/30 px-3 py-1 rounded text-sm transition disabled:opacity-50 flex items-center space-x-1"
                            >
                              {actionLoading === user._id ? <FiLoader className="animate-spin" /> : <FiX size={16} />}
                              <span>Suspend</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivate(user._id)}
                              disabled={actionLoading === user._id}
                              className="bg-green-600/20 text-green-400 hover:bg-green-600/30 px-3 py-1 rounded text-sm transition disabled:opacity-50 flex items-center space-x-1"
                            >
                              {actionLoading === user._id ? <FiLoader className="animate-spin" /> : <FiCheck size={16} />}
                              <span>Activate</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-slate-400">Showing page {pagination.currentPage} of {pagination.pages}</p>
            <div className="space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                disabled={page === pagination.pages}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminUsers;
