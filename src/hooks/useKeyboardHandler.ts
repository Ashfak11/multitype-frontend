// ============================================
// USE KEYBOARD HANDLER HOOK
// ============================================

import { useEffect, useCallback } from 'react';
import { IGNORED_KEYS } from '@/config/constants';

interface UseKeyboardHandlerOptions {
  onKeyPress: (key: string) => void;
  onReset?: () => void;
  enabled?: boolean;
}

export const useKeyboardHandler = ({
  onKeyPress,
  onReset,
  enabled = true,
}: UseKeyboardHandlerOptions): void => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      // Prevent default for space to avoid page scrolling
      if (e.key === ' ') {
        e.preventDefault();
      }

      // Handle Tab + Enter for reset
      if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault();
        onReset?.();
        return;
      }

      // Ignore modifier keys and special keys
      if (IGNORED_KEYS.includes(e.key as (typeof IGNORED_KEYS)[number])) {
        return;
      }

      onKeyPress(e.key);
    },
    [enabled, onKeyPress, onReset]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
