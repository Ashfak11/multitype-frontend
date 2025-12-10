// ============================================
// USE TYPING TEST HOOK - Core Typing Logic
// ============================================

import { useState, useCallback, useEffect, useRef } from 'react';
import { generateWords, calculateWPM, calculateAccuracy } from '@/utils/wordGenerator';
import { useTestConfig } from '@/context/TestConfigContext';
import { addResultToHistory } from '@/utils/storage';
import type { TypingState, CharState, TestResult, TestConfig } from '@/types';

interface UseTypingTestReturn extends TypingState {
  timeLeft: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  config: TestConfig;
  handleKeyPress: (key: string) => void;
  reset: () => void;
  getResult: () => TestResult | null;
}

const createInitialState = (words: string[]): TypingState => ({
  words,
  currentWordIndex: 0,
  currentCharIndex: 0,
  typedChars: new Map<string, CharState>(),
  isActive: false,
  isFinished: false,
  startTime: null,
  endTime: null,
  totalTyped: 0,
  correctTyped: 0,
  incorrectTyped: 0,
});

export const useTypingTest = (): UseTypingTestReturn => {
  const { config } = useTestConfig();
  const [state, setState] = useState<TypingState>(() =>
    createInitialState(generateWords(config.wordCount || 50, config))
  );
  const [timeLeft, setTimeLeft] = useState<number>(config.duration);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const resultSavedRef = useRef(false);

  // Reset when config changes
  useEffect(() => {
    reset();
  }, [config.duration, config.difficulty, config.punctuation, config.numbers]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    resultSavedRef.current = false;
    setState(createInitialState(generateWords(config.wordCount || 50, config)));
    setTimeLeft(config.duration);
  }, [config, clearTimer]);

  const finishTest = useCallback(() => {
    clearTimer();
    setState((s) => ({
      ...s,
      isFinished: true,
      isActive: false,
      endTime: Date.now(),
    }));
  }, [clearTimer]);

  const startTimer = useCallback(() => {
    if (timerRef.current) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [finishTest]);

  const handleKeyPress = useCallback(
    (key: string) => {
      setState((prev) => {
        if (prev.isFinished) return prev;

        let newState = { ...prev };

        // Start the test on first character press
        if (!prev.isActive && key.length === 1 && key !== ' ') {
          newState = {
            ...newState,
            isActive: true,
            startTime: Date.now(),
          };
          startTimer();
        }

        const currentWord = prev.words[prev.currentWordIndex];
        if (!currentWord) return prev;

        // Handle space - move to next word
        if (key === ' ') {
          if (prev.currentCharIndex > 0) {
            // Move to next word
            if (prev.currentWordIndex + 1 >= prev.words.length) {
              // All words completed
              return {
                ...newState,
                isFinished: true,
                isActive: false,
                endTime: Date.now(),
              };
            }
            return {
              ...newState,
              currentWordIndex: prev.currentWordIndex + 1,
              currentCharIndex: 0,
            };
          }
          return prev;
        }

        // Handle backspace
        if (key === 'Backspace') {
          if (prev.currentCharIndex > 0) {
            const charKey = `${prev.currentWordIndex}-${prev.currentCharIndex - 1}`;
            const newTypedChars = new Map(prev.typedChars);
            const charState = newTypedChars.get(charKey);
            newTypedChars.delete(charKey);

            return {
              ...newState,
              currentCharIndex: prev.currentCharIndex - 1,
              typedChars: newTypedChars,
              correctTyped:
                charState === 'correct' ? prev.correctTyped - 1 : prev.correctTyped,
              incorrectTyped:
                charState === 'incorrect' ? prev.incorrectTyped - 1 : prev.incorrectTyped,
              totalTyped: prev.totalTyped - 1,
            };
          }
          return prev;
        }

        // Handle regular character input
        if (key.length === 1) {
          const expectedChar = currentWord[prev.currentCharIndex];
          const isCorrect = key === expectedChar;
          const charKey = `${prev.currentWordIndex}-${prev.currentCharIndex}`;

          const newTypedChars = new Map(prev.typedChars);
          newTypedChars.set(charKey, isCorrect ? 'correct' : 'incorrect');

          const newCharIndex = prev.currentCharIndex + 1;

          // Auto-advance to next word if current word is complete
          if (newCharIndex >= currentWord.length) {
            if (prev.currentWordIndex + 1 >= prev.words.length) {
              // All words completed
              return {
                ...newState,
                currentCharIndex: newCharIndex,
                typedChars: newTypedChars,
                isFinished: true,
                isActive: false,
                endTime: Date.now(),
                totalTyped: prev.totalTyped + 1,
                correctTyped: isCorrect ? prev.correctTyped + 1 : prev.correctTyped,
                incorrectTyped: !isCorrect ? prev.incorrectTyped + 1 : prev.incorrectTyped,
              };
            }
          }

          return {
            ...newState,
            currentCharIndex: newCharIndex,
            typedChars: newTypedChars,
            totalTyped: prev.totalTyped + 1,
            correctTyped: isCorrect ? prev.correctTyped + 1 : prev.correctTyped,
            incorrectTyped: !isCorrect ? prev.incorrectTyped + 1 : prev.incorrectTyped,
          };
        }

        return prev;
      });
    },
    [startTimer]
  );

  // Calculate stats
  const elapsedTime = state.startTime
    ? ((state.endTime || Date.now()) - state.startTime)
    : 0;

  const wpm = calculateWPM(state.correctTyped, elapsedTime);
  const rawWpm = calculateWPM(state.totalTyped, elapsedTime);
  const accuracy = calculateAccuracy(state.correctTyped, state.totalTyped);

  // Get result for saving
  const getResult = useCallback((): TestResult | null => {
    if (!state.isFinished || !state.startTime || !state.endTime) {
      return null;
    }

    return {
      id: `local-${Date.now()}`,
      wpm,
      rawWpm,
      accuracy,
      correctChars: state.correctTyped,
      incorrectChars: state.incorrectTyped,
      totalChars: state.totalTyped,
      duration: (state.endTime - state.startTime) / 1000,
      config,
      timestamp: new Date().toISOString(),
    };
  }, [state, wpm, rawWpm, accuracy, config]);

  // Save result to local storage when test finishes
  useEffect(() => {
    if (state.isFinished && !resultSavedRef.current) {
      const result = getResult();
      if (result) {
        addResultToHistory(result);
        resultSavedRef.current = true;
      }
    }
  }, [state.isFinished, getResult]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return {
    ...state,
    timeLeft,
    wpm,
    rawWpm,
    accuracy,
    config,
    handleKeyPress,
    reset,
    getResult,
  };
};
