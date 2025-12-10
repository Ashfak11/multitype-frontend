// ============================================
// USE LEADERBOARD HOOK - Local High Scores
// ============================================

import { useLocalStorage } from './useLocalStorage';
import { useCallback, useMemo } from 'react';
import type { LeaderboardPeriod, TestDuration } from '@/types';

export interface LeaderboardScore {
  id: string;
  username: string;
  wpm: number;
  accuracy: number;
  duration: TestDuration;
  timestamp: string;
  avatar?: string;
}

const STORAGE_KEY = 'swifttype_leaderboard';
const MAX_SCORES = 50;

// Generate sample data for demo purposes
const generateSampleData = (): LeaderboardScore[] => {
  const usernames = [
    'SpeedDemon', 'TypeMaster', 'KeyboardNinja', 'SwiftFingers', 'CodeTyper',
    'RapidKeys', 'FlashType', 'QuickHands', 'ProTypist', 'KeyWarrior',
    'TypeRacer', 'FastFingers', 'KeyLegend', 'SpeedKing', 'TypeGod'
  ];
  
  const durations: TestDuration[] = [15, 30, 60, 120];
  const now = Date.now();
  
  return usernames.map((username, i) => ({
    id: crypto.randomUUID(),
    username,
    wpm: Math.floor(Math.random() * 80) + 60,
    accuracy: Math.floor(Math.random() * 15) + 85,
    duration: durations[Math.floor(Math.random() * durations.length)],
    timestamp: new Date(now - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  }));
};

export function useLeaderboard() {
  const [scores, setScores] = useLocalStorage<LeaderboardScore[]>(STORAGE_KEY, generateSampleData());

  const addScore = useCallback((score: Omit<LeaderboardScore, 'id' | 'timestamp'>) => {
    const newScore: LeaderboardScore = {
      ...score,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    
    setScores(prev => {
      const updated = [...prev, newScore]
        .sort((a, b) => b.wpm - a.wpm)
        .slice(0, MAX_SCORES);
      return updated;
    });
    
    return newScore;
  }, [setScores]);

  const getFilteredScores = useCallback((
    period: LeaderboardPeriod,
    duration?: TestDuration
  ) => {
    const now = Date.now();
    const periodMs = {
      daily: 24 * 60 * 60 * 1000,
      weekly: 7 * 24 * 60 * 60 * 1000,
      monthly: 30 * 24 * 60 * 60 * 1000,
      allTime: Infinity,
    };

    return scores
      .filter(score => {
        const scoreTime = new Date(score.timestamp).getTime();
        const withinPeriod = now - scoreTime <= periodMs[period];
        const matchesDuration = !duration || score.duration === duration;
        return withinPeriod && matchesDuration;
      })
      .sort((a, b) => b.wpm - a.wpm)
      .map((score, index) => ({ ...score, rank: index + 1 }));
  }, [scores]);

  const topScores = useMemo(() => {
    return scores
      .sort((a, b) => b.wpm - a.wpm)
      .slice(0, 10)
      .map((score, index) => ({ ...score, rank: index + 1 }));
  }, [scores]);

  return {
    scores,
    addScore,
    getFilteredScores,
    topScores,
  };
}
