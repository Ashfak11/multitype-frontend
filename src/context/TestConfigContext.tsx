// ============================================
// TEST CONFIG CONTEXT - Test Settings Management
// ============================================

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { TEST_DEFAULTS, STORAGE_KEYS } from '@/config/constants';
import type { TestConfig, TestDuration, TestDifficulty, TestMode } from '@/types';

interface TestConfigContextValue {
  config: TestConfig;
  setDuration: (duration: TestDuration) => void;
  setDifficulty: (difficulty: TestDifficulty) => void;
  setMode: (mode: TestMode) => void;
  setWordCount: (count: number) => void;
  togglePunctuation: () => void;
  toggleNumbers: () => void;
  resetConfig: () => void;
}

const defaultConfig: TestConfig = {
  duration: TEST_DEFAULTS.DURATION,
  difficulty: TEST_DEFAULTS.DIFFICULTY,
  mode: TEST_DEFAULTS.MODE,
  wordCount: TEST_DEFAULTS.WORD_COUNT,
  punctuation: TEST_DEFAULTS.PUNCTUATION,
  numbers: TEST_DEFAULTS.NUMBERS,
};

const TestConfigContext = createContext<TestConfigContextValue | undefined>(undefined);

export const TestConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<TestConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TEST_CONFIG);
      return stored ? { ...defaultConfig, ...JSON.parse(stored) } : defaultConfig;
    } catch {
      return defaultConfig;
    }
  });

  // Persist config changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEST_CONFIG, JSON.stringify(config));
  }, [config]);

  const setDuration = useCallback((duration: TestDuration) => {
    setConfig((prev) => ({ ...prev, duration }));
  }, []);

  const setDifficulty = useCallback((difficulty: TestDifficulty) => {
    setConfig((prev) => ({ ...prev, difficulty }));
  }, []);

  const setMode = useCallback((mode: TestMode) => {
    setConfig((prev) => ({ ...prev, mode }));
  }, []);

  const setWordCount = useCallback((wordCount: number) => {
    setConfig((prev) => ({ ...prev, wordCount }));
  }, []);

  const togglePunctuation = useCallback(() => {
    setConfig((prev) => ({ ...prev, punctuation: !prev.punctuation }));
  }, []);

  const toggleNumbers = useCallback(() => {
    setConfig((prev) => ({ ...prev, numbers: !prev.numbers }));
  }, []);

  const resetConfig = useCallback(() => {
    setConfig(defaultConfig);
  }, []);

  return (
    <TestConfigContext.Provider
      value={{
        config,
        setDuration,
        setDifficulty,
        setMode,
        setWordCount,
        togglePunctuation,
        toggleNumbers,
        resetConfig,
      }}
    >
      {children}
    </TestConfigContext.Provider>
  );
};

export const useTestConfig = (): TestConfigContextValue => {
  const context = useContext(TestConfigContext);
  if (!context) {
    throw new Error('useTestConfig must be used within a TestConfigProvider');
  }
  return context;
};
