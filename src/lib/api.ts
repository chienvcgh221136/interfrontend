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
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration and refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // If the error is 401 and it's not a retry request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/api/user/refresh-token`, { token: refreshToken });
          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          // Update the authorization header and retry the original request
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh token is invalid, logout user
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, just logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
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
  googleLogin: (data: { token: string }) =>
    api.post('/api/user/google-login', data),
  getProfile: () => api.get('/api/user/me'),
  
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
