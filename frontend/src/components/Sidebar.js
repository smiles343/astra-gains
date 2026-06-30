import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiShoppingCart, FiWallet, FiHistory, FiUser } from 'react-icons/fi';

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800';

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-700 min-h-screen p-4 hidden lg:block sticky top-0">
      <div className="space-y-2">
        <Link
          to="/dashboard"
          className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive('/dashboard')}`}
        >
          <FiHome /> <span>Dashboard</span>
        </Link>
        <Link
          to="/create-order"
          className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive('/create-order')}`}
        >
          <FiShoppingCart /> <span>Create Order</span>
        </Link>
        <Link
          to="/orders"
          className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive('/orders')}`}
        >
          <FiHistory /> <span>Order History</span>
        </Link>
        <Link
          to="/wallet"
          className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive('/wallet')}`}
        >
          <FiWallet /> <span>Wallet</span>
        </Link>
        <Link
          to="/profile"
          className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive('/profile')}`}
        >
          <FiUser /> <span>Profile</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
