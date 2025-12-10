// ============================================
// APPLICATION CONSTANTS
// ============================================

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws',
  TIMEOUT: 10000,
} as const;

// Test Configuration Defaults
export const TEST_DEFAULTS = {
  DURATION: 60 as const,
  WORD_COUNT: 50,
  DIFFICULTY: 'medium' as const,
  MODE: 'time' as const,
  PUNCTUATION: false,
  NUMBERS: false,
} as const;

// Room Configuration
export const ROOM_CONFIG = {
  CODE_LENGTH: 6,
  MAX_PLAYERS: 5,
  COUNTDOWN_SECONDS: 5,
  IDLE_TIMEOUT: 300000, // 5 minutes
} as const;

// UI Configuration
export const UI_CONFIG = {
  WORDS_VISIBLE: 30,
  TOAST_DURATION: 3000,
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 100,
} as const;

// Keyboard keys to ignore
export const IGNORED_KEYS = [
  'Shift', 'Control', 'Alt', 'Meta', 'Tab', 'Escape',
  'CapsLock', 'Insert', 'Delete', 'Home', 'End',
  'PageUp', 'PageDown', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
] as const;

// Test durations available
export const AVAILABLE_DURATIONS = [15, 30, 60, 120] as const;

// Accuracy thresholds for styling
export const ACCURACY_THRESHOLDS = {
  EXCELLENT: 98,
  GOOD: 95,
  AVERAGE: 85,
  POOR: 75,
} as const;

// WPM thresholds for achievements
export const WPM_THRESHOLDS = {
  BEGINNER: 30,
  INTERMEDIATE: 50,
  ADVANCED: 70,
  EXPERT: 90,
  MASTER: 120,
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  USER: 'swifttype_user',
  TEST_CONFIG: 'swifttype_test_config',
  THEME: 'swifttype_theme',
  RESULTS_HISTORY: 'swifttype_results_history',
} as const;
