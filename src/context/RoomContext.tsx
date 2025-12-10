// ============================================
// ROOM CONTEXT - Multiplayer Room State Management
// ============================================

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { wsManager } from '@/services/websocket';
import { roomService } from '@/services/api';
import type { Room, Player, RoomStatus, PlayerProgress, WSMessage } from '@/types';

interface RoomContextValue {
  room: Room | null;
  players: Player[];
  isHost: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  createRoom: (username: string) => Promise<string>;
  joinRoom: (roomCode: string, username: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  setReady: (ready: boolean) => Promise<void>;
  startGame: () => Promise<void>;
  updateProgress: (progress: PlayerProgress) => void;
}

const RoomContext = createContext<RoomContextValue | undefined>(undefined);

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPlayer = players.find((p) => p.id === wsManager.getPlayerId());
  const isHost = currentPlayer?.isHost ?? false;
  const isConnected = wsManager.isConnected();

  // Handle WebSocket messages
  useEffect(() => {
    if (!room) return;

    const unsubscribe = wsManager.onAny((message: WSMessage) => {
      switch (message.type) {
        case 'PLAYER_JOINED': {
          const payload = message.payload as { player: Player; room: Room };
          setRoom(payload.room);
          setPlayers(payload.room.players);
          break;
        }
        case 'PLAYER_LEFT': {
          const payload = message.payload as { playerId: string; room: Room };
          setRoom(payload.room);
          setPlayers(payload.room.players);
          break;
        }
        case 'PLAYER_READY': {
          const payload = message.payload as { playerId: string; ready: boolean };
          setPlayers((prev) =>
            prev.map((p) =>
              p.id === payload.playerId ? { ...p, isReady: payload.ready } : p
            )
          );
          break;
        }
        case 'GAME_STARTING': {
          setRoom((prev) => prev ? { ...prev, status: 'countdown' } : null);
          break;
        }
        case 'GAME_STARTED': {
          const payload = message.payload as { words: string[]; startTime: string };
          setRoom((prev) =>
            prev ? { ...prev, status: 'playing', words: payload.words, startTime: payload.startTime } : null
          );
          break;
        }
        case 'PLAYER_PROGRESS': {
          const payload = message.payload as { playerId: string; progress: PlayerProgress };
          setPlayers((prev) =>
            prev.map((p) =>
              p.id === payload.playerId ? { ...p, progress: payload.progress } : p
            )
          );
          break;
        }
        case 'GAME_FINISHED': {
          setRoom((prev) => prev ? { ...prev, status: 'finished' } : null);
          break;
        }
        case 'ERROR': {
          const payload = message.payload as { message: string };
          setError(payload.message);
          break;
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [room?.id]);

  const createRoom = useCallback(async (username: string): Promise<string> => {
    setIsConnecting(true);
    setError(null);

    try {
      const response = await roomService.createRoom({
        username,
        config: {
          duration: 60,
          difficulty: 'medium',
          mode: 'time',
          punctuation: false,
          numbers: false,
        },
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to create room');
      }

      const createdRoom = response.data;
      
      // Connect to WebSocket
      const playerId = createdRoom.players[0].id;
      await wsManager.connect(createdRoom.code, playerId);

      setRoom(createdRoom);
      setPlayers(createdRoom.players);

      return createdRoom.code;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create room';
      setError(message);
      throw new Error(message);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const joinRoom = useCallback(async (roomCode: string, username: string): Promise<void> => {
    setIsConnecting(true);
    setError(null);

    try {
      const response = await roomService.joinRoom({ roomCode, username });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to join room');
      }

      const joinedRoom = response.data;
      const currentPlayer = joinedRoom.players.find((p) => p.username === username);
      
      if (!currentPlayer) {
        throw new Error('Failed to find player in room');
      }

      // Connect to WebSocket
      await wsManager.connect(joinedRoom.code, currentPlayer.id);

      setRoom(joinedRoom);
      setPlayers(joinedRoom.players);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join room';
      setError(message);
      throw new Error(message);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const leaveRoom = useCallback(async (): Promise<void> => {
    if (room) {
      try {
        await roomService.leaveRoom(room.code);
      } finally {
        wsManager.disconnect();
        setRoom(null);
        setPlayers([]);
        setError(null);
      }
    }
  }, [room]);

  const setReady = useCallback(async (ready: boolean): Promise<void> => {
    if (room) {
      wsManager.sendReady(ready);
      await roomService.setReady(room.code, ready);
    }
  }, [room]);

  const startGame = useCallback(async (): Promise<void> => {
    if (room && isHost) {
      await roomService.startGame(room.code);
    }
  }, [room, isHost]);

  const updateProgress = useCallback((progress: PlayerProgress): void => {
    wsManager.sendProgress(progress);
  }, []);

  return (
    <RoomContext.Provider
      value={{
        room,
        players,
        isHost,
        isConnecting,
        isConnected,
        error,
        createRoom,
        joinRoom,
        leaveRoom,
        setReady,
        startGame,
        updateProgress,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = (): RoomContextValue => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};
