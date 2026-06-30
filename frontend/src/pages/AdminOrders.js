import React, { useEffect, useState } from 'react';
import { FiFilter, FiLoader } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../utils/api';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [pagination, setPagination] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editProgress, setEditProgress] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, [page, status]);

  const fetchOrders = async () => {
    try {
      const response = await api.get(`/admin/orders?page=${page}&status=${status}&limit=10`);
      setOrders(response.data.orders);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;
    setActionLoading(selectedOrder._id);
    try {
      await api.put(`/admin/orders/${selectedOrder._id}`, {
        status: editStatus,
        progress: editProgress
      });
      toast.success('Order updated successfully');
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order');
    } finally {
      setActionLoading(null);
    }
  };

  const openEditModal = (order) => {
    setSelectedOrder(order);
    setEditStatus(order.status);
    setEditProgress(order.progress);
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
      <AdminNavbar />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-white mb-8">Manage Orders</h1>

          {/* Filter */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
            <label className="block text-slate-300 text-sm font-medium mb-2">Filter by Status</label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Orders Table */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-4 px-6 text-slate-300 font-semibold">Order ID</th>
                    <th className="text-left py-4 px-6 text-slate-300 font-semibold">User</th>
                    <th className="text-left py-4 px-6 text-slate-300 font-semibold">Service</th>
                    <th className="text-left py-4 px-6 text-slate-300 font-semibold">Quantity</th>
                    <th className="text-left py-4 px-6 text-slate-300 font-semibold">Cost</th>
                    <th className="text-left py-4 px-6 text-slate-300 font-semibold">Progress</th>
                    <th className="text-left py-4 px-6 text-slate-300 font-semibold">Status</th>
                    <th className="text-left py-4 px-6 text-slate-300 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} className="border-b border-slate-700 hover:bg-slate-700/30 transition">
                      <td className="py-4 px-6 text-white font-mono text-sm">{order.orderId}</td>
                      <td className="py-4 px-6 text-white">{order.userId.username}</td>
                      <td className="py-4 px-6 text-slate-400">{order.serviceName}</td>
                      <td className="py-4 px-6 text-white">{order.quantity}</td>
                      <td className="py-4 px-6 text-white">${order.totalCost.toFixed(2)}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${order.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400">{order.progress}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                          order.status === 'completed' ? 'bg-green-600/20 text-green-400' :
                          order.status === 'processing' ? 'bg-blue-600/20 text-blue-400' :
                          order.status === 'pending' ? 'bg-yellow-600/20 text-yellow-400' :
                          'bg-red-600/20 text-red-400'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => openEditModal(order)}
                          className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 px-3 py-1 rounded text-sm transition"
                        >
                          Edit
                        </button>
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

          {/* Edit Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold text-white mb-6">Update Order</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Progress (%)</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={editProgress}
                      onChange={(e) => setEditProgress(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-slate-400 text-sm mt-2">{editProgress}%</p>
                  </div>
                </div>

                <div className="flex space-x-4 mt-8">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateOrder}
                    disabled={actionLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {actionLoading && <FiLoader className="animate-spin" />}
                    <span>Update</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminOrders;
