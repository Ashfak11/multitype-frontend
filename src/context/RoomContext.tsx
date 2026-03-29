// ============================================
// ROOM CONTEXT - Multiplayer Room State Management
// ============================================

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { wsManager } from '@/services/websocket/WebSocketManager';
import { roomService } from '@/services/api/roomService';
import type { Room, PlayerSnapshot, RoomState, WSEvent } from '@/types';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface RoomContextValue {
  room: RoomState | null;
  players: PlayerSnapshot[];
  isConnecting: boolean;
  isSyncing: boolean;
  isConnected: boolean;
  error: string | null;
  countdown: number | null;
  latestProgressEvent: any;
  syncRoom: (roomCode: string) => Promise<void>;
  createRoom: () => Promise<void>;
  joinRoom: (roomCode: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  setReady: () => void;
  sendProgress: (wordIndex: number, charIndex: number) => void;
  sendFinish: (wpm: number, accuracy: number, totalChars: number, correctChars: number) => void;
  playAgain: () => void;
}

const RoomContext = createContext<RoomContextValue | undefined>(undefined);

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth(); // Need token for WS connect
  const navigate = useNavigate();

  const [room, setRoom] = useState<RoomState | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [latestProgressEvent, setLatestProgressEvent] = useState<any>(null);

  // Derived state
  const players = room?.players || [];
  const isConnected = wsManager['connected'];

  // --- WebSocket Event Handlers ---

  const handlePlayerJoined = useCallback((payload: any) => {
    // payload: { newPlayer, allPlayers, roomStatus }
    setRoom((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        players: payload.allPlayers,
        roomStatus: payload.roomStatus,
      };
    });
    toast.info(`${payload.newPlayer.username} joined the room.`);
  }, []);

  const handlePlayerLeft = useCallback((payload: any) => {
    // payload: { playerId, username, roomStatus }
    setRoom((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        players: prev.players.filter(p => p.playerId !== payload.playerId),
        roomStatus: payload.roomStatus,
      };
    });
    toast.info(`${payload.username} left the room.`);
  }, []);

  const handlePlayerReady = useCallback((payload: any) => {
    // payload: { playerId, username, playerStatus, allReady }
    setRoom((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        players: prev.players.map(p =>
          p.playerId === payload.playerId ? { ...p, playerStatus: payload.playerStatus } : p
        ),
      };
    });
  }, []);

  const handleCountdown = useCallback((payload: any) => {
    // payload: { count, wordsPayload }
    console.log('[RoomContext] COUNTDOWN count:', payload.count, 'words:', payload.wordsPayload);

    if (payload.count === 0 && payload.wordsPayload) {
      console.log('[RoomContext] → setting IN_PROGRESS');
      setRoom((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          roomStatus: 'IN_PROGRESS',
          wordsPayload: payload.wordsPayload,
        };
      });
      setCountdown(null); // Clear countdown when game starts
    } else {
      setCountdown(payload.count);
      setRoom((prev) => prev ? { ...prev, roomStatus: 'COUNTDOWN' } : null);
    }
  }, []);

  const handleGameOver = useCallback((payload: any) => {
    // payload: { winnerId, winnerUsername, finalStandings, roomStatus }
    setRoom((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        roomStatus: 'FINISHED',
        players: payload.finalStandings || prev.players, // Update with final standings if provided
      };
    });
    // Maybe show a toast or modal?
    if (payload.winnerUsername) {
      toast.success(`Game Over! Winner: ${payload.winnerUsername}`);
    }
  }, []);

  const handleProgressUpdate = useCallback((payload: any) => {
    // payload: { playerId, username, currentWordIndex, currentCharIndex, totalWords }
    console.log('[RoomContext] PROGRESS_UPDATE received:', payload);
    setLatestProgressEvent(payload);

    setRoom((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        players: prev.players.map(p =>
          p.playerId === payload.playerId
            ? {
              ...p,
              currentWordIndex: payload.currentWordIndex,
              currentCharIndex: payload.currentCharIndex ?? 0 // fallback if backend doesn't send it yet
            }
            : p
        )
      };
    });
  }, []);

  const handleRoomClosed = useCallback((payload: any) => {
    toast.error(`Room closed: ${payload.reason}`);
    setRoom(null);
    navigate('/');
  }, [navigate]);

  // Initialize WS listeners when room exists
  useEffect(() => {
    if (!room || !room.roomCode) return;

    const unsubJoined = wsManager.on('PLAYER_JOINED', (e) => handlePlayerJoined(e.payload));
    const unsubLeft = wsManager.on('PLAYER_LEFT', (e) => handlePlayerLeft(e.payload));
    const unsubReady = wsManager.on('PLAYER_READY', (e) => handlePlayerReady(e.payload));
    const unsubCountdown = wsManager.on('COUNTDOWN', (e) => handleCountdown(e.payload));
    const unsubProgress = wsManager.on('PROGRESS_UPDATE', (e) => handleProgressUpdate(e.payload));
    const unsubGameOver = wsManager.on('GAME_OVER', (e) => handleGameOver(e.payload));
    const unsubClosed = wsManager.on('ROOM_CLOSED', (e) => handleRoomClosed(e.payload));

    return () => {
      unsubJoined();
      unsubLeft();
      unsubReady();
      unsubCountdown();
      unsubProgress();
      unsubGameOver();
      unsubClosed();
    };
  }, [room?.roomCode, handlePlayerJoined, handlePlayerLeft, handlePlayerReady, handleCountdown, handleProgressUpdate, handleGameOver, handleRoomClosed]);

  // --- Actions ---

  // Helper to fetch state - used by join/create/sycn
  const fetchRoomState = useCallback(async (roomCode: string) => {
    const stateResponse = await roomService.getRoomState(roomCode);
    if (stateResponse.success && stateResponse.data) {
      const rawState = stateResponse.data as any;
      const roomState = rawState.data || rawState;
      setRoom(roomState);
    }
  }, []);

  const createRoom = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      // Step 1: Call API first, get roomCode
      const response = await roomService.createRoom();

      if (response.success && response.data) {
        // Handle potential double-nesting (response.data.data) or direct (response.data)
        const rawData = response.data as any;
        const roomData = rawData.data || rawData;
        const roomCode = roomData.roomCode;

        if (!roomCode) {
          console.error("Room code not found in response", response);
          throw new Error("Invalid server response: missing room code");
        }

        // Initially we set the basic room state, BUT we will immediately fetch the full state
        const newRoom: RoomState = {
          roomId: roomData.roomId,
          roomCode: roomCode,
          roomStatus: roomData.roomStatus as any,
          players: [
            {
              playerId: roomData.creator?.playerId || user?.playerId || '',
              username: user?.username || '',
              role: 'CREATOR',
              playerStatus: 'IDLE',
              currentWordIndex: 0,
              currentCharIndex: 0
            }
          ],
          wordsPayload: null
        };
        setRoom(newRoom);

        // Step 2: Connect WebSocket
        if (token) {
          await wsManager.connect(token);

          // Step 3: Subscribe
          console.log(`[RoomContext] Subscribing to room: ${roomCode}`);
          wsManager.subscribeToRoom(roomCode);

          // Step 4: Fetch latest state to ensure players list is correct
          await fetchRoomState(roomCode);
        }

        // Navigate
        navigate(`/room/${roomCode}`);
      } else {
        throw new Error('Failed to create room');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create room');
      toast.error('Failed to create room');
    } finally {
      setIsConnecting(false);
    }
  }, [token, user, navigate, fetchRoomState]);

  const joinRoom = useCallback(async (roomCode: string) => {
    setIsConnecting(true);
    setError(null);
    try {
      if (token) {
        await wsManager.connect(token);
      }

      const response = await roomService.joinRoom(roomCode);
      if (response.success && response.data) {
        // FIX: Handle nested data same as createRoom
        const rawData = response.data as any;
        const roomData = rawData.data || rawData;
        const validRoomCode = roomData.roomCode || roomCode; // Fallback to requested code if match

        // Subscribe
        wsManager.subscribeToRoom(validRoomCode);

        // Fetch latest state immediately to populate players
        await fetchRoomState(validRoomCode);

        navigate(`/room/${validRoomCode}`);
      } else {
        throw new Error('Failed to join room');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to join room');
      toast.error(err.message || 'Failed to join room');
      wsManager.disconnect();
    } finally {
      setIsConnecting(false);
    }
  }, [token, navigate, fetchRoomState]);

  const syncRoom = useCallback(async (roomCode: string) => {
    if (isSyncing) return; // Prevent duplicate calls

    // Used to restore state or enter room without re-joining (e.g. refresh, or creator flow)
    setIsSyncing(true);
    setError(null);
    try {
      if (token) await wsManager.connect(token);

      // Connect first, then fetch state
      wsManager.subscribeToRoom(roomCode);
      await fetchRoomState(roomCode);

    } catch (err: any) {
      console.error("Sync room failed:", err);
      setError(err.message || "Failed to sync room");
    } finally {
      setIsSyncing(false);
    }
  }, [token, fetchRoomState, isSyncing]);

  // ... (leaveRoom and others)

  const leaveRoom = useCallback(async () => {
    if (!room?.roomCode) return;

    try {
      await roomService.leaveRoom(room.roomCode);
      wsManager.disconnect();
      setRoom(null);
      navigate('/');
      toast.success("Left the room");
    } catch (e) {
      console.error("Failed to leave room clean:", e);
      wsManager.disconnect();
      setRoom(null);
      navigate('/');
    }
  }, [room, navigate]);

  const setReady = () => {
    if (!room) return;
    wsManager.sendReady(room.roomCode);
  };

  const sendProgress = (index: number, charIndex: number) => {
    if (!room) return;
    try {
      // @ts-ignore - wsManager might not be updated in types yet but logic is there
      wsManager.sendProgress(room.roomCode, index, charIndex);
    } catch (e) {
      console.error("Failed to send progress", e);
    }
  }

  const sendFinish = (wpm: number, accuracy: number, totalChars: number, correctChars: number) => {
    if (!room) return;

    console.log('[RoomContext] Sending finish stats:', { wpm, accuracy, totalChars, correctChars });

    // Using direct send as per requirements, since we need to send a body
    wsManager.send(`/app/room/${room.roomCode}/finish`, {
      wpm,
      accuracy,
      totalCharsTyped: totalChars, // Map totalChars -> totalCharsTyped as per backend DTO
      correctChars
    });
  }

  const playAgain = useCallback(() => {
    if (!room?.roomCode) return;

    console.log('[RoomContext] Requesting play again');
    wsManager.send(`/app/room/${room.roomCode}/playAgain`, {});

    // Optimistically reset room status to WAITING
    setRoom(prev => prev ? { ...prev, roomStatus: 'WAITING' } : prev);
  }, [room?.roomCode]);

  return (
    <RoomContext.Provider
      value={{
        room,
        players,
        isConnecting: isConnecting || isSyncing,
        isSyncing,
        isConnected: true, // TODO: hook up real connection state
        error,
        countdown,
        latestProgressEvent,
        createRoom,
        joinRoom,
        syncRoom,
        leaveRoom,
        setReady,
        sendProgress,
        sendFinish,
        playAgain
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
