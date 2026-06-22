import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('av_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLoginRoute = err.config?.url?.includes('/auth/login');
    if (err.response?.status === 401 && !isLoginRoute) {
      localStorage.removeItem('av_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

export default api;
