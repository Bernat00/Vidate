import axios, { AxiosHeaders } from 'axios';

export const getBaseUrl = () => {
  const { hostname, protocol, port } = window.location;
  if (port === '5173') {
    return `${protocol}//${hostname}:8000/api`;
  }

  return window.location.origin + '/api';
};

const baseUrl = getBaseUrl()

const api = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.clear();
      sessionStorage.clear();
    } else if (error?.response?.status === 403 && error.response?.data?.detail === "Your account has been banned.") {
      localStorage.clear();
      sessionStorage.clear();
      window.dispatchEvent(new CustomEvent('auth:banned', { detail: "Your account has been banned." }));
    }
    return Promise.reject(error);
  }
);

export default api;
