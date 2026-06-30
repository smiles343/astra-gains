import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { FiLoader, FiArrowRight } from 'react-icons/fi';
import { createOrder, getServices, getWalletBalance } from '../utils/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const CreateOrder = () => {
  const [services, setServices] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [formData, setFormData] = useState({
    serviceId: '',
    link: '',
    quantity: '',
  });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, walletRes] = await Promise.all([
          getServices(),
          getWalletBalance(),
        ]);
        setServices(servicesRes.data.services || []);
        setWallet(walletRes.data);
      } catch (error) {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      await createOrder(formData);
      toast.success('Order created successfully!');
      navigate('/orders');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create order');
    } finally {
      setCreating(false);
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
          <h1 className="text-3xl font-bold text-white mb-8">Create New Order</h1>

          {/* Wallet Info */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
            <p className="text-slate-400">Current Wallet Balance</p>
            <p className="text-3xl font-bold text-white mt-2">${wallet?.balance.toFixed(2)}</p>
          </div>

          {/* Form */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 max-w-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Selection */}
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Select Service *</label>
                <select
                  name="serviceId"
                  value={formData.serviceId}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Choose a service --</option>
                  {services.map((service) => (
                    <option key={service.service} value={service.service}>
                      {service.name} (${(service.rate / 1000).toFixed(4)} per 1k)
                    </option>
                  ))}
                </select>
              </div>

              {/* Link */}
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Link/Username *</label>
                <input
                  type="text"
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  placeholder="https://instagram.com/username or @username"
                  required
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="Enter quantity"
                  min="1"
                  required
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={creating}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {creating && <FiLoader className="animate-spin" />}
                <span>{creating ? 'Creating Order...' : 'Create Order'}</span>
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateOrder;
