// src/lib/api.js
import axios from 'axios';

const API_BASE_RAW = process.env.REACT_APP_API_BASE || '/api';
// strip trailing slashes; endpoints should start with "/"
const API_BASE = API_BASE_RAW.replace(/\/+$/, '');

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
