// ============================================
// USER SERVICE - User API Operations
// ============================================

import { httpClient } from './httpClient';
import type { ApiResponse, User, UserStats } from '@/types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export const userService = {
  // Authentication
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return httpClient.post<LoginResponse>('/auth/login', credentials);
  },

  async register(data: RegisterRequest): Promise<ApiResponse<LoginResponse>> {
    return httpClient.post<LoginResponse>('/auth/register', data);
  },

  async logout(): Promise<ApiResponse<void>> {
    return httpClient.post<void>('/auth/logout');
  },

  // User Profile
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return httpClient.get<User>('/users/me');
  },

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return httpClient.patch<User>('/users/me', data);
  },

  async getUserById(userId: string): Promise<ApiResponse<User>> {
    return httpClient.get<User>(`/users/${userId}`);
  },

  // User Stats
  async getUserStats(userId?: string): Promise<ApiResponse<UserStats>> {
    const endpoint = userId ? `/users/${userId}/stats` : '/users/me/stats';
    return httpClient.get<UserStats>(endpoint);
  },
};
