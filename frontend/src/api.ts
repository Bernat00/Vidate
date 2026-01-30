import axios, { AxiosHeaders } from 'axios';

const baseUrl = 'http://localhost:8000/api'

const api = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    if (!token) return config;

    if (config.headers instanceof AxiosHeaders) {
      config.headers.set('Authorization', `Bearer ${token}`);
      return config;
    }

    // If headers is a plain object (or undefined), normalize to AxiosHeaders.
    const headers = new AxiosHeaders(config.headers);
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;

    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to centralize 401 handling (optional)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.clear();
      sessionStorage.clear();
      // Optionally redirect: window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
