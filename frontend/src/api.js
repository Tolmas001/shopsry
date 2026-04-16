import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;

    if (status === 401) {
      if (!window.location.pathname.includes('/login')) {
        window.location.href = `/login?redirect=${window.location.pathname}`;
      }
    } else if (status === 500) {
      window.location.href = '/error/500';
    }

    return Promise.reject(error);
  }
);

export const auth = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  register: (username, email, password) => api.post('/auth/register', { username, email, password }),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  googleLogin: (credential) => api.post('/auth/google-login', { credential }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (email, code, newPassword) => api.post('/auth/reset-password', { email, code, newPassword }),
  getMyReviews: () => api.get('/auth/my-reviews'),
};

export const products = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  like: (id) => api.post(`/products/${id}/like`),
  addComment: (id, text, image) => api.post(`/products/${id}/comments`, { text, image }),
};

export const categories = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const orders = {
  getAll: () => api.get('/orders'),
  getAdmin: () => api.get('/orders/admin'),
  getOne: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
};

export const stats = {
  get: () => api.get('/stats'),
};

export const admin = {
  getUsers: () => api.get('/users'),
  deleteUser: (id) => api.delete(`/users/${id}`),
  deleteReview: (productId, index) => api.delete(`/products/${productId}/comments/${index}`),
};

export const demo = {
  seed: () => api.post('/demo/seed')
};

export default api;