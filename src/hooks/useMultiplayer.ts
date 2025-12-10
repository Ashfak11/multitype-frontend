// ============================================
// USE MULTIPLAYER HOOK - Multiplayer Game Logic
// ============================================

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRoom } from '@/context/RoomContext';
import type { TypingState, CharState, PlayerProgress } from '@/types';

interface UseMultiplayerReturn extends TypingState {
  timeLeft: number;
  wpm: number;
  accuracy: number;
  countdown: number | null;
  handleKeyPress: (key: string) => void;
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

export const useMultiplayer = (): UseMultiplayerReturn => {
  const { room, updateProgress } = useRoom();
  const [state, setState] = useState<TypingState>(
    createInitialState(room?.words || [])
  );
  const [timeLeft, setTimeLeft] = useState<number>(room?.config.duration || 60);
  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressThrottleRef = useRef<NodeJS.Timeout | null>(null);

  // Reset state when room words change
  useEffect(() => {
    if (room?.words) {
      setState(createInitialState(room.words));
      setTimeLeft(room.config.duration);
    }
  }, [room?.words, room?.config.duration]);

  // Handle room status changes
  useEffect(() => {
    if (room?.status === 'countdown') {
      setCountdown(5);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev && prev <= 1) {
            clearInterval(interval);
            return null;
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [room?.status]);

  // Start timer when game starts
  useEffect(() => {
    if (room?.status === 'playing' && !timerRef.current) {
      setState((prev) => ({
        ...prev,
        isActive: true,
        startTime: Date.now(),
      }));

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            setState((s) => ({ ...s, isFinished: true, isActive: false, endTime: Date.now() }));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [room?.status]);

  // Throttled progress update
  const sendProgressUpdate = useCallback(
    (newState: TypingState) => {
      if (progressThrottleRef.current) return;

      const elapsedTime = newState.startTime
        ? (Date.now() - newState.startTime) / 1000 / 60
        : 0;
      const wpm = elapsedTime > 0 ? Math.round((newState.correctTyped / 5) / elapsedTime) : 0;
      const accuracy = newState.totalTyped > 0
        ? Math.round((newState.correctTyped / newState.totalTyped) * 100)
        : 100;

      const progress: PlayerProgress = {
        currentWordIndex: newState.currentWordIndex,
        currentCharIndex: newState.currentCharIndex,
        wpm,
        accuracy,
        finished: newState.isFinished,
        finishTime: newState.endTime ?? undefined,
      };

      updateProgress(progress);

      progressThrottleRef.current = setTimeout(() => {
        progressThrottleRef.current = null;
      }, 100); // Throttle to 10 updates per second
    },
    [updateProgress]
  );

  const handleKeyPress = useCallback(
    (key: string) => {
      if (room?.status !== 'playing') return;

      setState((prev) => {
        if (prev.isFinished) return prev;

        const currentWord = prev.words[prev.currentWordIndex];
        if (!currentWord) return prev;

        let newState = { ...prev };

        // Handle space
        if (key === ' ') {
          if (prev.currentCharIndex > 0) {
            if (prev.currentWordIndex + 1 >= prev.words.length) {
              newState = {
                ...newState,
                isFinished: true,
                isActive: false,
                endTime: Date.now(),
              };
            } else {
              newState = {
                ...newState,
                currentWordIndex: prev.currentWordIndex + 1,
                currentCharIndex: 0,
              };
            }
          } else {
            return prev;
          }
        }
        // Handle backspace
        else if (key === 'Backspace') {
          if (prev.currentCharIndex > 0) {
            const charKey = `${prev.currentWordIndex}-${prev.currentCharIndex - 1}`;
            const newTypedChars = new Map(prev.typedChars);
            const charState = newTypedChars.get(charKey);
            newTypedChars.delete(charKey);

            newState = {
              ...newState,
              currentCharIndex: prev.currentCharIndex - 1,
              typedChars: newTypedChars,
              correctTyped: charState === 'correct' ? prev.correctTyped - 1 : prev.correctTyped,
              incorrectTyped: charState === 'incorrect' ? prev.incorrectTyped - 1 : prev.incorrectTyped,
              totalTyped: prev.totalTyped - 1,
            };
          } else {
            return prev;
          }
        }
        // Handle character input
        else if (key.length === 1) {
          const expectedChar = currentWord[prev.currentCharIndex];
          const isCorrect = key === expectedChar;
          const charKey = `${prev.currentWordIndex}-${prev.currentCharIndex}`;

          const newTypedChars = new Map(prev.typedChars);
          newTypedChars.set(charKey, isCorrect ? 'correct' : 'incorrect');

          const newCharIndex = prev.currentCharIndex + 1;

          newState = {
            ...newState,
            currentCharIndex: newCharIndex,
            typedChars: newTypedChars,
            totalTyped: prev.totalTyped + 1,
            correctTyped: isCorrect ? prev.correctTyped + 1 : prev.correctTyped,
            incorrectTyped: !isCorrect ? prev.incorrectTyped + 1 : prev.incorrectTyped,
          };

          // Check if all words complete
          if (newCharIndex >= currentWord.length && prev.currentWordIndex + 1 >= prev.words.length) {
            newState = {
              ...newState,
              isFinished: true,
              isActive: false,
              endTime: Date.now(),
            };
          }
        } else {
          return prev;
        }

        // Send progress update
        sendProgressUpdate(newState);
        return newState;
      });
    },
    [room?.status, sendProgressUpdate]
  );

  // Calculate stats
  const elapsedTime = state.startTime
    ? ((state.endTime || Date.now()) - state.startTime) / 1000 / 60
    : 0;

  const wpm = elapsedTime > 0 ? Math.round((state.correctTyped / 5) / elapsedTime) : 0;
  const accuracy = state.totalTyped > 0
    ? Math.round((state.correctTyped / state.totalTyped) * 100)
    : 100;

  // Cleanup
  useEffect(() => {
    return () => {
      if (progressThrottleRef.current) {
        clearTimeout(progressThrottleRef.current);
      }
    };
  }, []);

  return {
    ...state,
    timeLeft,
    wpm,
    accuracy,
    countdown,
    handleKeyPress,
  };
};
