import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiLogOut, FiSettings } from 'react-icons/fi';

const AdminNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/admin" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg flex items-center justify-center font-bold text-white">⚙️</div>
            <span className="text-white font-bold text-lg hidden sm:inline">Astra Gains Admin</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/admin" className="text-slate-300 hover:text-white transition">
              Dashboard
            </Link>
            <Link to="/admin/users" className="text-slate-300 hover:text-white transition">
              Users
            </Link>
            <Link to="/admin/orders" className="text-slate-300 hover:text-white transition">
              Orders
            </Link>
            <Link to="/admin/audit-logs" className="text-slate-300 hover:text-white transition">
              Audit Logs
            </Link>
            <div className="border-l border-slate-700 pl-6 flex items-center space-x-4">
              <Link to="/admin/settings" className="text-slate-300 hover:text-white transition">
                <FiSettings size={20} />
              </Link>
              <button
                onClick={handleLogout}
                className="text-slate-300 hover:text-red-400 transition"
              >
                <FiLogOut size={20} />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white"
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700 p-4 space-y-3">
          <Link to="/admin" className="block text-slate-300 hover:text-white transition py-2">
            Dashboard
          </Link>
          <Link to="/admin/users" className="block text-slate-300 hover:text-white transition py-2">
            Users
          </Link>
          <Link to="/admin/orders" className="block text-slate-300 hover:text-white transition py-2">
            Orders
          </Link>
          <Link to="/admin/audit-logs" className="block text-slate-300 hover:text-white transition py-2">
            Audit Logs
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full text-left text-red-400 hover:text-red-300 transition py-2"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default AdminNavbar;
