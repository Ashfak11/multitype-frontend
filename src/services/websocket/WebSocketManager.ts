// ============================================
// WEBSOCKET MANAGER - Real-time Communication
// ============================================

import { API_CONFIG } from '@/config/constants';
import type { WSMessage, WSMessageType, PlayerProgress } from '@/types';

export type WSEventHandler = (message: WSMessage) => void;

class WebSocketManager {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventHandlers: Map<WSMessageType, Set<WSEventHandler>> = new Map();
  private globalHandlers: Set<WSEventHandler> = new Set();
  private roomCode: string | null = null;
  private playerId: string | null = null;

  connect(roomCode: string, playerId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.roomCode = roomCode;
      this.playerId = playerId;

      const url = `${API_CONFIG.WS_URL}/rooms/${roomCode}?playerId=${playerId}`;
      
      try {
        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
          console.log('[WebSocket] Connected to room:', roomCode);
          this.reconnectAttempts = 0;
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const message: WSMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('[WebSocket] Failed to parse message:', error);
          }
        };

        this.socket.onclose = (event) => {
          console.log('[WebSocket] Connection closed:', event.code, event.reason);
          this.handleDisconnect();
        };

        this.socket.onerror = (error) => {
          console.error('[WebSocket] Error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close(1000, 'User disconnected');
      this.socket = null;
    }
    this.roomCode = null;
    this.playerId = null;
    this.eventHandlers.clear();
    this.globalHandlers.clear();
  }

  private handleMessage(message: WSMessage): void {
    // Call type-specific handlers
    const handlers = this.eventHandlers.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => handler(message));
    }

    // Call global handlers
    this.globalHandlers.forEach((handler) => handler(message));
  }

  private handleDisconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.roomCode && this.playerId) {
      this.reconnectAttempts++;
      console.log(`[WebSocket] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        if (this.roomCode && this.playerId) {
          this.connect(this.roomCode, this.playerId).catch(() => {
            console.error('[WebSocket] Reconnection failed');
          });
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  on(type: WSMessageType, handler: WSEventHandler): () => void {
    if (!this.eventHandlers.has(type)) {
      this.eventHandlers.set(type, new Set());
    }
    this.eventHandlers.get(type)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.eventHandlers.get(type)?.delete(handler);
    };
  }

  onAny(handler: WSEventHandler): () => void {
    this.globalHandlers.add(handler);
    return () => {
      this.globalHandlers.delete(handler);
    };
  }

  send<T>(type: WSMessageType, payload: T): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      const message: WSMessage<T> = {
        type,
        payload,
        timestamp: new Date().toISOString(),
      };
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('[WebSocket] Cannot send message - not connected');
    }
  }

  // Convenience methods for common actions
  sendProgress(progress: PlayerProgress): void {
    this.send('PLAYER_PROGRESS', { playerId: this.playerId, progress });
  }

  sendReady(ready: boolean): void {
    this.send('PLAYER_READY', { playerId: this.playerId, ready });
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  getPlayerId(): string | null {
    return this.playerId;
  }

  getRoomCode(): string | null {
    return this.roomCode;
  }
}

// Singleton instance
export const wsManager = new WebSocketManager();
