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
  // Create Room
  async createRoom(): Promise<ApiResponse<{ roomId: number; roomCode: string; roomStatus: string; creator: any }>> {
    console.log('[RoomService] Creating room');
    return httpClient.post('/rooms/create');
  },

  // Join Room
  async joinRoom(roomCode: string): Promise<ApiResponse<Room>> {
    console.log(`[RoomService] Joining room: ${roomCode}`);
    return httpClient.post('/rooms/join', { roomCode: roomCode.trim().toUpperCase() });
  },

  // Get Room State
  async getRoomState(roomCode: string): Promise<ApiResponse<Room>> {
    const sanitizedCode = roomCode.trim().toUpperCase();
    // Backend returns { success: true, data: { ... } } which matches ApiResponse<Room>
    return httpClient.get<Room>(`/rooms/${sanitizedCode}/state`);
  },

  // Leave Room
  async leaveRoom(roomCode: string): Promise<ApiResponse<void>> {
    return httpClient.post<void>(`/rooms/${roomCode.trim().toUpperCase()}/leave`);
  },
};
