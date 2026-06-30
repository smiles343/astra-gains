import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiBarChart3, FiUsers, FiShoppingCart, FiFileText } from 'react-icons/fi';

const AdminSidebar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800';

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-700 min-h-screen p-4 hidden lg:block sticky top-0">
      <div className="space-y-2">
        <Link
          to="/admin"
          className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive('/admin')}`}
        >
          <FiBarChart3 /> <span>Dashboard</span>
        </Link>
        <Link
          to="/admin/users"
          className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive('/admin/users')}`}
        >
          <FiUsers /> <span>Manage Users</span>
        </Link>
        <Link
          to="/admin/orders"
          className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive('/admin/orders')}`}
        >
          <FiShoppingCart /> <span>Manage Orders</span>
        </Link>
        <Link
          to="/admin/audit-logs"
          className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive('/admin/audit-logs')}`}
        >
          <FiFileText /> <span>Audit Logs</span>
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
