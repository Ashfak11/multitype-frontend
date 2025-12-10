// ============================================
// LOCAL STORAGE UTILITIES
// ============================================

import { STORAGE_KEYS } from '@/config/constants';
import type { TestResult, TestConfig } from '@/types';

const MAX_HISTORY_ITEMS = 100;

// Generic storage helpers
export function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
}

// Test Results History
export function getResultsHistory(): TestResult[] {
  return getItem<TestResult[]>(STORAGE_KEYS.RESULTS_HISTORY, []);
}

export function addResultToHistory(result: TestResult): void {
  const history = getResultsHistory();
  history.unshift(result);
  
  // Keep only last N results
  if (history.length > MAX_HISTORY_ITEMS) {
    history.splice(MAX_HISTORY_ITEMS);
  }
  
  setItem(STORAGE_KEYS.RESULTS_HISTORY, history);
}

export function clearResultsHistory(): void {
  removeItem(STORAGE_KEYS.RESULTS_HISTORY);
}

// Test Configuration
export function getStoredConfig(): TestConfig | null {
  return getItem<TestConfig | null>(STORAGE_KEYS.TEST_CONFIG, null);
}

export function saveConfig(config: TestConfig): void {
  setItem(STORAGE_KEYS.TEST_CONFIG, config);
}

// Theme
export function getStoredTheme(): string {
  return getItem<string>(STORAGE_KEYS.THEME, 'dark');
}

export function saveTheme(theme: string): void {
  setItem(STORAGE_KEYS.THEME, theme);
}

// Guest Username
export function getGuestUsername(): string {
  return getItem<string>('swifttype_guest_username', '');
}

export function saveGuestUsername(username: string): void {
  setItem('swifttype_guest_username', username);
}
