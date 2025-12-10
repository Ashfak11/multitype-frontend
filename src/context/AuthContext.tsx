// ============================================
// AUTH CONTEXT - Authentication State Management
// ============================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { userService } from '@/services/api';
import { STORAGE_KEYS } from '@/config/constants';
import type { User } from '@/types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from storage on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const response = await userService.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            // Token invalid, clear it
            localStorage.removeItem('auth_token');
          }
        } catch (error) {
          console.error('Failed to load user:', error);
          localStorage.removeItem('auth_token');
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await userService.login({ email, password });
    
    if (response.success && response.data) {
      localStorage.setItem('auth_token', response.data.token);
      setUser(response.data.user);
    } else {
      throw new Error(response.error?.message || 'Login failed');
    }
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    const response = await userService.register({ username, email, password });
    
    if (response.success && response.data) {
      localStorage.setItem('auth_token', response.data.token);
      setUser(response.data.user);
    } else {
      throw new Error(response.error?.message || 'Registration failed');
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await userService.logout();
    } finally {
      localStorage.removeItem('auth_token');
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
