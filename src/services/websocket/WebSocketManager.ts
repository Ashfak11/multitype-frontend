// ============================================
// WEBSOCKET MANAGER - STOMP Implementation
// ============================================

import { Client, IMessage } from '@stomp/stompjs';
import { WSEvent, WSEventType } from '@/types';

// Define the shape of our event handler
type WSEventHandler = (event: WSEvent) => void;

class WebSocketManager {
  private client: Client | null = null;
  private connected: boolean = false;
  private roomSubscription: any = null; // StompSubscription
  private eventHandlers: Map<WSEventType, Set<WSEventHandler>> = new Map();
  private debug: boolean = true;

  constructor() {
    this.client = null;
  }

  /**
   * Connect to the WebSocket server using STOMP over raw Websocket
   * @param token JWT token for authentication
   */
  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // If already connected, just resolve
      if (this.client?.connected) {
        resolve();
        return;
      }


      const brokerURL = `${import.meta.env.VITE_WS_URL}/websocket`;

      this.client = new Client({
        brokerURL,
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        debug: (str) => {
          if (this.debug) console.log('[STOMP] ' + str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: (frame) => {
          this.connected = true;
          console.log('[STOMP] Connected');
          resolve();
        },
        onStompError: (frame) => {
          console.error('[STOMP] Broker reported error: ' + frame.headers['message']);
          console.error('[STOMP] Additional details: ' + frame.body);
          reject(new Error(frame.headers['message']));
        },
        onWebSocketClose: () => {
          this.connected = false;
          console.log('[STOMP] Connection closed');
        },
        onDisconnect: () => {
          this.connected = false;
          console.log('[STOMP] Disconnected');
        }
      });

      this.client.activate();
    });
  }

  /**
   * Subscribe to a specific room topic
   * @param roomCode The room code to listen to
   */
  subscribeToRoom(roomCode: string, onMessageReceived?: (event: WSEvent) => void) {
    if (!this.client || !this.client.connected) {
      console.error('[STOMP] Cannot subscribe - not connected');
      return;
    }

    if (this.roomSubscription) {
      this.roomSubscription.unsubscribe();
    }

    console.log(`[STOMP] Subscribing to /topic/room/${roomCode}`);
    this.roomSubscription = this.client.subscribe(`/topic/room/${roomCode}`, (message: IMessage) => {
      try {
        const event: WSEvent = JSON.parse(message.body);
        this.handleEvent(event);
        if (onMessageReceived) {
          onMessageReceived(event);
        }
      } catch (error) {
        console.error('[STOMP] Failed to parse message body', error);
      }
    });
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.connected = false;
    }
  }

  /**
   * Publish READY event
   */
  sendReady(roomCode: string) {
    this.publish(roomCode, 'ready', {});
  }

  /**
   * Publish PROGRESS event (Word completion)
   * @param currentCharIndex The number of characters typed in current word
   */
  sendProgress(roomCode: string, currentWordIndex: number, currentCharIndex: number) {
    this.publish(roomCode, 'progress', { currentWordIndex, currentCharIndex });
  }

  /**
   * Publish FINISH event
   */
  sendFinish(roomCode: string) {
    this.publish(roomCode, 'finish', {});
  }

  /**
   * Generic publish method
   */
  private publish(roomCode: string, endpoint: string, body: any) {
    if (!this.client || !this.client.connected) {
      console.warn('[STOMP] Cannot publish - not connected');
      return;
    }

    // Destination: /app/room/{roomCode}/{endpoint}
    // e.g. /app/room/A3FX9K/ready
    const destination = `/app/room/${roomCode}/${endpoint}`;
    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  /**
   * Generic send method for arbitrary destinations
   */
  send(destination: string, body: any) {
    if (!this.client || !this.client.connected) {
      console.warn('[STOMP] Cannot send - not connected');
      return;
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  // --- Event Handling ---

  /**
   * Register an event handler for a specific event type
   */
  on(type: WSEventType, handler: WSEventHandler): () => void {
    if (!this.eventHandlers.has(type)) {
      this.eventHandlers.set(type, new Set());
    }
    this.eventHandlers.get(type)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(type);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  /**
   * Dispatch event to registered handlers
   */
  private handleEvent(event: WSEvent) {
    if (this.debug) console.log('[STOMP] Received Event:', event.type, event.payload);

    const handlers = this.eventHandlers.get(event.type);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(event);
        } catch (error) {
          console.error(`[STOMP] Error in handler for ${event.type}:`, error);
        }
      });
    }
  }
}

export const wsManager = new WebSocketManager();
