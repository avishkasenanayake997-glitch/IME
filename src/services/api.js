// Axios client – ready for the future Node.js/Express + PostgreSQL backend.
// While VITE_USE_MOCK !== 'false' the services in this folder use the localStorage store instead.
import axios from 'axios';

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexus_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
