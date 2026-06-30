import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// User Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateOrder from './pages/CreateOrder';
import Wallet from './pages/Wallet';
import OrderHistory from './pages/OrderHistory';
import Profile from './pages/Profile';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminOrders from './pages/AdminOrders';
import AdminAuditLogs from './pages/AdminAuditLogs';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!token ? <Login setToken={setToken} /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!token ? <Register setToken={setToken} /> : <Navigate to="/dashboard" />} />

        {/* User Protected Routes */}
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/create-order" element={token ? <CreateOrder /> : <Navigate to="/login" />} />
        <Route path="/wallet" element={token ? <Wallet /> : <Navigate to="/login" />} />
        <Route path="/orders" element={token ? <OrderHistory /> : <Navigate to="/login" />} />
        <Route path="/profile" element={token ? <Profile /> : <Navigate to="/login" />} />

        {/* Admin Protected Routes */}
        <Route path="/admin" element={token ? <AdminDashboard /> : <Navigate to="/login" />} />
        <Route path="/admin/users" element={token ? <AdminUsers /> : <Navigate to="/login" />} />
        <Route path="/admin/orders" element={token ? <AdminOrders /> : <Navigate to="/login" />} />
        <Route path="/admin/audit-logs" element={token ? <AdminAuditLogs /> : <Navigate to="/login" />} />

        {/* Default Route */}
        <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
