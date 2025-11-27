import axios from 'axios';

// Get the raw URL from env
let rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Normalize: remove trailing slash
rawUrl = rawUrl.replace(/\/+$/, '');

// Auto-append /api ONLY if it’s missing
const API_URL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;

console.log("Using API URL:", API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
