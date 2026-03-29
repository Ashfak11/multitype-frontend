// ============================================
// SWIFTTYPE - TYPE DEFINITIONS
// ============================================

// ==================== User Types ====================
export interface User {
  playerId: string;    // UUID from backend
  username: string;
  role: string;
  createdAt: string;
  // Stats are not currently returned by backend, making optional
  stats?: UserStats;
}

export interface LoginResponse {
  token: string;
}

export interface UserStats {
  totalTests: number;
  avgWpm: number;
  avgAccuracy: number;
  bestWpm: number;
  totalTimeTyped: number; // in seconds
}

// ==================== Typing Test Types ====================
export type TestDuration = 15 | 30 | 60 | 120;
export type TestDifficulty = 'easy' | 'medium' | 'hard';
export type TestMode = 'time' | 'words' | 'quote';

export interface TestConfig {
  duration: TestDuration;
  difficulty: TestDifficulty;
  mode: TestMode;
  wordCount?: number;
  punctuation: boolean;
  numbers: boolean;
}

export interface TestResult {
  id: string;
  userId?: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  duration: number;
  config: TestConfig;
  timestamp: string;
}

export interface TypingState {
  words: string[];
  currentWordIndex: number;
  currentCharIndex: number;
  typedChars: Map<string, CharState>;
  isActive: boolean;
  isFinished: boolean;
  startTime: number | null;
  endTime: number | null;
  totalTyped: number;
  correctTyped: number;
  incorrectTyped: number;
}

export type CharState = 'correct' | 'incorrect' | 'extra';

// ==================== Room/Multiplayer Types ====================
export type RoomStatus = 'WAITING' | 'COUNTDOWN' | 'INGAME' | 'IN_PROGRESS' | 'FINISHED'; // Matches backend enum usually, or mapped
export type PlayerRole = 'CREATOR' | 'JOINER';
export type PlayerStatus = 'IDLE' | 'READY' | 'IN_GAME' | 'FINISHED';

export interface Room {
  roomId: number;
  roomCode: string;
  roomStatus: RoomStatus;
  players: PlayerSnapshot[];
  wordsPayload?: string; // "the quick brown..."
}

export interface PlayerSnapshot {
  playerId: string;
  username: string;
  role: PlayerRole;
  playerStatus: PlayerStatus;
  currentWordIndex: number;
  currentCharIndex: number;
  // WPM/Stats might not be in snapshot yet, but we can compute or add if backend sends
}

// Response from /api/rooms/{roomCode}/state
export interface RoomState {
  roomId: number;
  roomCode: string;
  roomStatus: RoomStatus;
  players: PlayerSnapshot[];
  wordsPayload: string | null;
}

// ==================== WebSocket Types ====================
// Incoming Events from Backend
export type WSEventType =
  | 'PLAYER_JOINED'
  | 'PLAYER_LEFT'
  | 'PLAYER_READY'
  | 'COUNTDOWN'
  | 'PROGRESS_UPDATE'
  | 'GAME_OVER'
  | 'ROOM_CLOSED';

export interface WSEvent<T = any> {
  type: WSEventType;
  payload: T;
  // timestamp might not be in all events, backend specific
}

export interface WSPlayerJoinedPayload {
  newPlayer: PlayerSnapshot;
  allPlayers: PlayerSnapshot[];
  roomStatus: RoomStatus;
}

export interface WSPlayerLeftPayload {
  playerId: string;
  username: string;
  roomStatus: RoomStatus;
}

export interface WSPlayerReadyPayload {
  playerId: string;
  username: string;
  playerStatus: PlayerStatus;
  allReady: boolean;
}

export interface WSCountdownPayload {
  count: number;
  wordsPayload?: string; // Sent when count === 0
}

export interface WSProgressUpdatePayload {
  playerId: string;
  username: string;
  currentWordIndex: number;
  currentCharIndex: number;
  totalWords: number;
}

// Helper for sending progress
export interface WSProgressMessage {
  currentWordIndex: number;
  currentCharIndex: number;
}

export interface WSGameOverPayload {
  winnerId: string;
  winnerUsername: string;
  finalStandings: PlayerSnapshot[]; // assuming standings usually return players
  roomStatus: RoomStatus;
}

export interface WSRoomClosedPayload {
  reason: string;
  roomStatus: RoomStatus;
}

// Error payload
export interface WSErrorPayload {
  code: string;
  message: string;
}

// ==================== API Types ====================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ==================== Leaderboard Types ====================
export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'allTime';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar?: string;
  wpm: number;
  accuracy: number;
  timestamp: string;
}

export interface LeaderboardFilters {
  period: LeaderboardPeriod;
  difficulty?: TestDifficulty;
  duration?: TestDuration;
  limit?: number;
}
