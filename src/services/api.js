import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    const guestToken = localStorage.getItem('guestToken');
    if (guestToken && config.url.includes('/guest')) {
      config.headers.Authorization = `Bearer ${guestToken}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if it's a guest route - don't redirect for guest routes
    const isGuestRoute = error.config?.url?.includes('/guest');
    
    // Only redirect for admin routes (non-guest routes)
    if (error.response?.status === 401 && !isGuestRoute) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // For guest routes, just reject the promise so component can handle it
    return Promise.reject(error);
  }
);

export default api;