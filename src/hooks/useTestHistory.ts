// ============================================
// USE TEST HISTORY HOOK - Local Storage for Test Results
// ============================================

import { useLocalStorage } from './useLocalStorage';
import { useCallback, useMemo } from 'react';
import type { TestResult, TestConfig } from '@/types';

export interface StoredTestResult extends Omit<TestResult, 'id' | 'userId'> {
  id: string;
}

const STORAGE_KEY = 'swifttype_test_history';
const MAX_RESULTS = 100;

export function useTestHistory() {
  const [results, setResults] = useLocalStorage<StoredTestResult[]>(STORAGE_KEY, []);

  const addResult = useCallback((result: Omit<StoredTestResult, 'id' | 'timestamp'>) => {
    const newResult: StoredTestResult = {
      ...result,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    
    setResults(prev => {
      const updated = [newResult, ...prev];
      return updated.slice(0, MAX_RESULTS);
    });
    
    return newResult;
  }, [setResults]);

  const clearHistory = useCallback(() => {
    setResults([]);
  }, [setResults]);

  const stats = useMemo(() => {
    if (results.length === 0) {
      return {
        totalTests: 0,
        avgWpm: 0,
        avgAccuracy: 0,
        bestWpm: 0,
        totalTimeTyped: 0,
        recentTrend: [] as number[],
      };
    }

    const totalTests = results.length;
    const avgWpm = Math.round(results.reduce((acc, r) => acc + r.wpm, 0) / totalTests);
    const avgAccuracy = Math.round(results.reduce((acc, r) => acc + r.accuracy, 0) / totalTests);
    const bestWpm = Math.max(...results.map(r => r.wpm));
    const totalTimeTyped = results.reduce((acc, r) => acc + r.duration, 0);
    const recentTrend = results.slice(0, 10).map(r => r.wpm).reverse();

    return {
      totalTests,
      avgWpm,
      avgAccuracy,
      bestWpm,
      totalTimeTyped,
      recentTrend,
    };
  }, [results]);

  const getResultsByConfig = useCallback((config: Partial<TestConfig>) => {
    return results.filter(r => {
      if (config.duration && r.config.duration !== config.duration) return false;
      if (config.difficulty && r.config.difficulty !== config.difficulty) return false;
      return true;
    });
  }, [results]);

  const personalBests = useMemo(() => {
    const durations = [15, 30, 60, 120] as const;
    return durations.map(duration => {
      const filtered = results.filter(r => r.config.duration === duration);
      if (filtered.length === 0) return { duration, wpm: 0, accuracy: 0, date: null };
      const best = filtered.reduce((a, b) => a.wpm > b.wpm ? a : b);
      return {
        duration,
        wpm: best.wpm,
        accuracy: best.accuracy,
        date: best.timestamp,
      };
    });
  }, [results]);

  return {
    results,
    addResult,
    clearHistory,
    stats,
    getResultsByConfig,
    personalBests,
  };
}
