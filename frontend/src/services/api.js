import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tech4um_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally — clear token and redirect
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tech4um_token');
      localStorage.removeItem('tech4um_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ---- Auth ----
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// ---- Forums ----
export const forumsApi = {
  list: (params) => api.get('/forums', { params }),
  getOne: (id) => api.get(`/forums/${id}`),
  create: (data) => api.post('/forums', data),
};

// ---- Messages ----
export const messagesApi = {
  getByForum: (forumId, params) => api.get(`/messages/forums/${forumId}`, { params }),
  create: (forumId, data) => api.post(`/messages/forums/${forumId}`, data),
};

// ---- Users ----
export const usersApi = {
  search: (q) => api.get('/users/search', { params: { q } }),
  getById: (id) => api.get(`/users/${id}`),
};

export default api;
