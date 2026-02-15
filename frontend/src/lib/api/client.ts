import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to get auth token from localStorage
const getTokenFromStorage = () => {
  try {
    const stored = localStorage.getItem('auth-store');
    if (stored) {
      const data = JSON.parse(stored);
      return data.token || null;
    }
  } catch {
    // Silently fail
  }
  return null;
};

// Request interceptor to add JWT token
client.interceptors.request.use(
  (config) => {
    const token = getTokenFromStorage();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const stored = localStorage.getItem('auth-store');
        const authData = stored ? JSON.parse(stored) : null;
        const refreshToken = authData?.refreshToken;

        if (refreshToken) {
          const response = await axios.post(
            `${API_URL}/token/refresh/`,
            { refresh: refreshToken }
          );
          const { access } = response.data;

          // Update token in storage
          if (authData) {
            authData.token = access;
            localStorage.setItem('auth-store', JSON.stringify(authData));
          }

          originalRequest.headers.Authorization = `Bearer ${access}`;
          return client(originalRequest);
        } else {
          localStorage.removeItem('auth-store');
          window.location.href = '/login';
        }
      } catch {
        localStorage.removeItem('auth-store');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default client;
