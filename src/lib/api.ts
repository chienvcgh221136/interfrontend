import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('id');
      localStorage.removeItem('username');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authApi = {
  // User
  userRegister: (data: { username: string; password: string }) =>
    api.post('/api/user/register', data),
  userLogin: (data: { username: string; password: string }) =>
    api.post('/api/user/login', data),
  
  // Admin
  adminLogin: (data: { username: string; password: string }) =>
    api.post('/api/admin/login', data),
};

// URL APIs
export const urlApi = {
  shorten: (data: { originalUrl: string }) =>
    api.post('/api/url/shorten', data),
  shortenCustom: (data: { originalUrl: string; customCode: string }) =>
    api.post('/api/url/custom', data),
  getAll: () => api.get('/api/url'),
  delete: (id: string) => api.delete(`/api/url/${id}`),
};

// User APIs
export const userApi = {
  getAll: () => api.get('/api/user'),
  getById: (id: string) => api.get(`/api/user/${id}`),
  update: (id: string, data: { username?: string; password?: string }) =>
    api.put(`/api/user/${id}`, data),
  delete: (id: string) => api.delete(`/api/user/${id}`),
};

// Admin APIs
export const adminApi = {
  getAll: () => api.get('/api/admin'),
  getById: (id: string) => api.get(`/api/admin/${id}`),
  update: (id: string, data: { username?: string; password?: string }) =>
    api.put(`/api/admin/${id}`, data),
  delete: (id: string) => api.delete(`/api/admin/${id}`),
};

export default api;
