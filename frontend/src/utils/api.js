import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const registerUser = (userData) => api.post('/auth/register', userData);
export const loginUser = (credentials) => api.post('/auth/login', credentials);

// Wallet APIs
export const getWalletBalance = () => api.get('/wallet/balance');
export const depositFunds = (amount) => api.post('/wallet/deposit', { amount });
export const withdrawFunds = (amount) => api.post('/wallet/withdraw', { amount });
export const getTransactions = () => api.get('/wallet/transactions');

// Order APIs
export const createOrder = (orderData) => api.post('/orders/create', orderData);
export const getOrders = () => api.get('/orders/my-orders');
export const getOrderDetails = (orderId) => api.get(`/orders/${orderId}`);

// Services APIs
export const getServices = () => api.get('/services');

// User APIs
export const getUserProfile = () => api.get('/user/profile');

export default api;
