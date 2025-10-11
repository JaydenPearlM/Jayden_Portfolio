import axios from 'axios';

// Ensure no trailing slash; default to '/api' for local proxy
const API_BASE = (process.env.REACT_APP_API_BASE || '/api').replace(/\/+$/, '');

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;