// ============================================
// SWIFTTYPE - TYPE DEFINITIONS
// ============================================

// ==================== User Types ====================
export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  createdAt: string;
  stats: UserStats;
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
export type RoomStatus = 'waiting' | 'countdown' | 'playing' | 'finished';

export interface Room {
  id: string;
  code: string;
  hostId: string;
  status: RoomStatus;
  config: TestConfig;
  players: Player[];
  words: string[];
  startTime?: string;
  endTime?: string;
  createdAt: string;
}

export interface Player {
  id: string;
  username: string;
  avatar?: string;
  isHost: boolean;
  isReady: boolean;
  progress: PlayerProgress;
}

export interface PlayerProgress {
  currentWordIndex: number;
  currentCharIndex: number;
  wpm: number;
  accuracy: number;
  finished: boolean;
  finishTime?: number;
}

// ==================== WebSocket Types ====================
export type WSMessageType = 
  | 'ROOM_CREATED'
  | 'ROOM_JOINED'
  | 'PLAYER_JOINED'
  | 'PLAYER_LEFT'
  | 'PLAYER_READY'
  | 'GAME_STARTING'
  | 'GAME_STARTED'
  | 'PLAYER_PROGRESS'
  | 'GAME_FINISHED'
  | 'ERROR';

export interface WSMessage<T = unknown> {
  type: WSMessageType;
  payload: T;
  timestamp: string;
}

export interface WSRoomCreatedPayload {
  room: Room;
}

export interface WSPlayerJoinedPayload {
  player: Player;
  room: Room;
}

export interface WSPlayerProgressPayload {
  playerId: string;
  progress: PlayerProgress;
}

export interface WSGameStartingPayload {
  countdown: number;
}

export interface WSGameStartedPayload {
  startTime: string;
  words: string[];
}

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
