import React, { useEffect, useState } from 'react';
import { FiFilter } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../utils/api';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('all');
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchLogs();
  }, [page, action]);

  const fetchLogs = async () => {
    try {
      const response = await api.get(`/admin/audit-logs?page=${page}&action=${action}&limit=20`);
      setLogs(response.data.logs);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  const getActionColor = (action) => {
    switch (action) {
      case 'login':
        return 'bg-blue-600/20 text-blue-400';
      case 'create_order':
        return 'bg-green-600/20 text-green-400';
      case 'suspend_user':
        return 'bg-red-600/20 text-red-400';
      case 'delete_user':
        return 'bg-red-600/20 text-red-400';
      case 'update_order':
        return 'bg-purple-600/20 text-purple-400';
      default:
        return 'bg-gray-600/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <AdminNavbar />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-white mb-8">Audit Logs</h1>

          {/* Filter */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
            <label className="block text-slate-300 text-sm font-medium mb-2">Filter by Action</label>
            <select
              value={action}
              onChange={(e) => { setAction(e.target.value); setPage(1); }}
              className="bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Actions</option>
              <option value="login">Login</option>
              <option value="create_order">Create Order</option>
              <option value="deposit">Deposit</option>
              <option value="withdraw">Withdraw</option>
              <option value="suspend_user">Suspend User</option>
              <option value="delete_user">Delete User</option>
              <option value="update_order">Update Order</option>
            </select>
          </div>

          {/* Logs Table */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-4 px-6 text-slate-300 font-semibold">Timestamp</th>
                    <th className="text-left py-4 px-6 text-slate-300 font-semibold">Admin</th>
                    <th className="text-left py-4 px-6 text-slate-300 font-semibold">Action</th>
                    <th className="text-left py-4 px-6 text-slate-300 font-semibold">Target</th>
                    <th className="text-left py-4 px-6 text-slate-300 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id} className="border-b border-slate-700 hover:bg-slate-700/30 transition">
                      <td className="py-4 px-6 text-white text-sm">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="py-4 px-6 text-white">{log.userId?.username || 'System'}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getActionColor(log.action)}`}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-400 text-sm font-mono">{log.target}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          log.status === 'success' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
                        }`}>
                          {log.status}
                        </span>
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

export default AuditLogs;
