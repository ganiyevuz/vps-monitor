import { create } from 'zustand';
import type { User } from '../../types/auth';

type AuthStoreState = {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setToken: (token: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  clearAuth: () => void;
};

// Helper to get stored auth from localStorage
const getStoredAuth = () => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('auth-store');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const stored = getStoredAuth();

export const useAuthStore = create<AuthStoreState>((set) => ({
  token: stored?.token || null,
  refreshToken: stored?.refreshToken || null,
  user: stored?.user || null,
  isAuthenticated: stored?.isAuthenticated || false,

  setToken: (token: string, refreshToken: string) => {
    set((state) => {
      const newState = {
        ...state,
        token,
        refreshToken,
        isAuthenticated: true,
      };
      // Save to localStorage immediately
      try {
        localStorage.setItem('auth-store', JSON.stringify(newState));
      } catch {
        // Silently fail
      }
      return newState;
    });
  },

  setUser: (user: User) => {
    set((state) => {
      const newState = {
        ...state,
        user,
      };
      // Save to localStorage immediately
      try {
        localStorage.setItem('auth-store', JSON.stringify(newState));
      } catch {
        // Silently fail
      }
      return newState;
    });
  },

  logout: () => {
    set({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    });
    try {
      localStorage.removeItem('auth-store');
    } catch {
      // Silently fail
    }
  },

  clearAuth: () => {
    set({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    });
    try {
      localStorage.removeItem('auth-store');
    } catch {
      // Silently fail
    }
  },
}));
