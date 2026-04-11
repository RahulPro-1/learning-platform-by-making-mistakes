/**
 * client.ts
 * Centralised Axios instance. Automatically attaches the JWT token
 * from localStorage to every request.
 */

import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

// Attach token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, clear stale credentials (session expired)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(err);
  }
);

export default api;
