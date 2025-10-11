// Browser-only API client. No server imports here.
import axios from 'axios';

const API_BASE = (process.env.REACT_APP_API_BASE || '/api').replace(/\/+$/, '');

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

// Optional helper for building absolute URLs to uploads, etc.
export const API_ORIGIN = API_BASE.replace(/\/api$/, '');
