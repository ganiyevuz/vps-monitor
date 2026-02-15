import axios from 'axios';
import { TokenResponse, LoginRequest, User } from '../../types/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const authApi = {
  login: async (credentials: LoginRequest) => {
    const response = await axios.post<TokenResponse>(
      `${API_URL}/token/`,
      credentials
    );
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await axios.post<{ access: string }>(
      `${API_URL}/token/refresh/`,
      { refresh: refreshToken }
    );
    return response.data;
  },

  getMe: async (token: string) => {
    // This assumes there's a /me/ endpoint that returns the current user
    // If not, we can fetch from the admin API or handle differently
    const response = await axios.get<User>(`${API_URL}/auth/me/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
