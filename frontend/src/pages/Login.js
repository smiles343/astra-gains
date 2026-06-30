import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiLoader } from 'react-icons/fi';
import { loginUser } from '../utils/api';

const Login = ({ setToken }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await loginUser(formData);
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-white text-2xl mx-auto mb-4">
            AG
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Astra Gains</h1>
          <p className="text-slate-400">SMM Panel Login</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-lg p-8 space-y-6">
          {/* Email */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-3 text-slate-500" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3 text-slate-500" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading && <FiLoader className="animate-spin" />}
            <span>{loading ? 'Logging in...' : 'Login'}</span>
          </button>
        </form>

        {/* Register Link */}
        <p className="text-center text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 hover:text-blue-300">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
