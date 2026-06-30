import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { getOrders } from '../utils/api';
import { toast } from 'react-toastify';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getOrders();
        setOrders(response.data.orders);
      } catch (error) {
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter((order) => order.status === filter);

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
          <h1 className="text-3xl font-bold text-white mb-8">Order History</h1>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3 mb-8">
            {['all', 'pending', 'processing', 'completed', 'failed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-semibold transition capitalize ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Orders Table */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            {filteredOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 text-slate-400 font-semibold">Service</th>
                      <th className="text-left py-3 text-slate-400 font-semibold">Link</th>
                      <th className="text-left py-3 text-slate-400 font-semibold">Quantity</th>
                      <th className="text-left py-3 text-slate-400 font-semibold">Cost</th>
                      <th className="text-left py-3 text-slate-400 font-semibold">Progress</th>
                      <th className="text-left py-3 text-slate-400 font-semibold">Status</th>
                      <th className="text-left py-3 text-slate-400 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order._id} className="border-b border-slate-700 hover:bg-slate-700/50">
                        <td className="py-3 text-white">{order.serviceName}</td>
                        <td className="py-3 text-white text-sm truncate">{order.link}</td>
                        <td className="py-3 text-white">{order.quantity}</td>
                        <td className="py-3 text-white">${order.totalCost.toFixed(2)}</td>
                        <td className="py-3">
                          <div className="w-16 bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${order.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400">{order.progress}%</span>
                        </td>
                        <td className="py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                            order.status === 'completed' ? 'bg-green-600/20 text-green-400' :
                            order.status === 'processing' ? 'bg-blue-600/20 text-blue-400' :
                            order.status === 'pending' ? 'bg-yellow-600/20 text-yellow-400' :
                            'bg-red-600/20 text-red-400'
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
              <p className="text-slate-400 text-center py-8">No orders found</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default OrderHistory;
