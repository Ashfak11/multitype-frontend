// ============================================
// AUTH CONTEXT - Authentication State Management
// ============================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { userService } from '@/services/api';
import { STORAGE_KEYS } from '@/config/constants';
import type { User } from '@/types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Load user from storage on mount
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const response = await userService.getCurrentUser();
          if (response.success && response.data) {
            // Backend returns data wrapped in a 'data' field
            const userData = (response.data as any).data || response.data;
            setUser(userData);
          } else {
            // Token invalid, clear it
            localStorage.removeItem('auth_token');
            setToken(null);
          }
        } catch (error) {
          console.error('Failed to load user:', error);
          localStorage.removeItem('auth_token');
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const response = await userService.login({ username, password });

    if (response.success && response.data) {
      const newToken = response.data.token;
      localStorage.setItem('auth_token', newToken);
      setToken(newToken);

      // After getting token, fetch user details
      const userResponse = await userService.getCurrentUser();
      if (userResponse.success && userResponse.data) {
        // Backend returns data wrapped in a 'data' field
        const userData = (userResponse.data as any).data || userResponse.data;
        setUser(userData);
      } else {
        throw new Error('Failed to fetch user profile');
      }
    } else {
      throw new Error(response.error?.message || 'Login failed');
    }
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    const response = await userService.register({ username, password });

    // Register returns void (201 Created), so we auto-login
    if (response.success) {
      await login(username, password);
    } else {
      throw new Error(response.error?.message || 'Registration failed');
    }
  }, [login]);

  const logout = useCallback(async () => {
    try {
      await userService.logout();
    } finally {
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => prev ? { ...prev, ...data } : null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
