import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { FiUser, FiMail, FiCheckCircle } from 'react-icons/fi';
import { getUserProfile } from '../utils/api';
import { toast } from 'react-toastify';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getUserProfile();
        setUser(response.data.user);
      } catch (error) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
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
          <h1 className="text-3xl font-bold text-white mb-8">User Profile</h1>

          {/* Profile Card */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 max-w-md">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-white text-2xl">
                {user?.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{user?.username}</p>
                <p className="text-slate-400 text-sm">Account Status: <span className="text-green-400">Active</span></p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-center space-x-3 p-4 bg-slate-700/50 rounded-lg">
                <FiMail className="text-blue-400" />
                <div>
                  <p className="text-slate-400 text-sm">Email</p>
                  <p className="text-white font-semibold">{user?.email}</p>
                </div>
              </div>

              {/* Joined Date */}
              <div className="flex items-center space-x-3 p-4 bg-slate-700/50 rounded-lg">
                <FiCheckCircle className="text-green-400" />
                <div>
                  <p className="text-slate-400 text-sm">Member Since</p>
                  <p className="text-white font-semibold">{new Date(user?.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                <div>
                  <p className="text-slate-400 text-sm">Total Orders</p>
                  <p className="text-2xl font-bold text-white">{user?.totalOrders}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Total Spent</p>
                  <p className="text-2xl font-bold text-white">${user?.totalSpent.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
