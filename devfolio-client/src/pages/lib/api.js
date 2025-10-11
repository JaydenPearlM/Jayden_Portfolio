// src/pages/lib/api.js
import axios from 'axios';

// Base URL: use .env or local '/api' fallback
const API_BASE = (process.env.REACT_APP_API_BASE || '/api').replace(/\/+$/, '');

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false, // disable cookie-based CORS checks
  timeout: 15000,
});

// Automatically attach admin token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

console.log('[api] baseURL =', API_BASE);

export default api;
