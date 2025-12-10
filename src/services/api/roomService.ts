// ============================================
// ROOM SERVICE - Multiplayer Room API Operations
// ============================================

import { httpClient } from './httpClient';
import type { ApiResponse, Room, TestConfig } from '@/types';

export interface CreateRoomRequest {
  config: TestConfig;
  username: string;
}

export interface JoinRoomRequest {
  roomCode: string;
  username: string;
}

export const roomService = {
  // Room Management
  async createRoom(data: CreateRoomRequest): Promise<ApiResponse<Room>> {
    return httpClient.post<Room>('/rooms', data);
  },

  async joinRoom(data: JoinRoomRequest): Promise<ApiResponse<Room>> {
    return httpClient.post<Room>(`/rooms/${data.roomCode}/join`, { username: data.username });
  },

  async leaveRoom(roomCode: string): Promise<ApiResponse<void>> {
    return httpClient.post<void>(`/rooms/${roomCode}/leave`);
  },

  async getRoom(roomCode: string): Promise<ApiResponse<Room>> {
    return httpClient.get<Room>(`/rooms/${roomCode}`);
  },

  // Room Actions
  async setReady(roomCode: string, ready: boolean): Promise<ApiResponse<void>> {
    return httpClient.post<void>(`/rooms/${roomCode}/ready`, { ready });
  },

  async startGame(roomCode: string): Promise<ApiResponse<void>> {
    return httpClient.post<void>(`/rooms/${roomCode}/start`);
  },

  async kickPlayer(roomCode: string, playerId: string): Promise<ApiResponse<void>> {
    return httpClient.post<void>(`/rooms/${roomCode}/kick`, { playerId });
  },
};
