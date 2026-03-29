import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface WordDisplayProps {
  words: string[];
  currentWordIndex: number;
  currentCharIndex: number;
  typedChars: Map<string, 'correct' | 'incorrect' | 'extra'>;
  opponentIndex?: number;
  opponentCharIndex?: number;
}

export const WordDisplay: React.FC<WordDisplayProps> = ({
  words,
  currentWordIndex,
  currentCharIndex,
  typedChars,
  opponentIndex,
  opponentCharIndex,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLSpanElement>(null);
  const [scrollOffset, setScrollOffset] = useState(0);

  // Calculate scroll offset to keep active word centered
  useEffect(() => {
    if (!activeWordRef.current || !containerRef.current) return;

    const wordTop = activeWordRef.current.offsetTop;
    const containerHeight = containerRef.current.clientHeight;
    const wordHeight = activeWordRef.current.clientHeight;

    // Center the word: container middle - word position
    const targetScroll = wordTop - containerHeight / 2 + wordHeight / 2;

    setScrollOffset(targetScroll);
  }, [currentWordIndex, currentCharIndex]);

  return (
    <div
      ref={containerRef}
      className="relative h-[200px] overflow-hidden select-none"
    >
      <div
        className="font-mono text-2xl md:text-3xl leading-relaxed transition-transform duration-150 ease-out"
        style={{ transform: `translateY(-${Math.max(0, scrollOffset)}px)` }}
      >
        {words.map((word, wordIndex) => {
          const isMyCurrentWord = wordIndex === currentWordIndex;

          return (
            <span
              key={wordIndex}
              ref={isMyCurrentWord ? activeWordRef : null}
              className="inline-block mr-3 mb-2 relative"
            >
              {word.split('').map((char, charIndex) => {
                const charKey = `${wordIndex}-${charIndex}`;
                const charState = typedChars.get(charKey);
                const isCurrent = isMyCurrentWord && charIndex === currentCharIndex;
                const isPending =
                  wordIndex > currentWordIndex ||
                  (wordIndex === currentWordIndex && charIndex > currentCharIndex);
                const isTyped = charState !== undefined;

                // Opponent Caret Logic
                const isOpponentCaret =
                  wordIndex === opponentIndex && charIndex === (opponentCharIndex ?? -1);

                return (
                  <span key={charIndex} className="relative inline-block">
                    <span
                      className={cn(
                        'typing-char relative',
                        isCurrent && 'typing-char-current',
                        isOpponentCaret && 'typing-char-opponent',
                        !isCurrent && charState === 'correct' && 'typing-char-correct',
                        !isCurrent && charState === 'incorrect' && 'typing-char-incorrect',
                        !isCurrent && !isTyped && isPending && 'typing-char-pending'
                      )}
                    >
                      {char}
                    </span>
                  </span>
                );
              })}

              {/* Opponent Caret at the END of the word */}
              {wordIndex === opponentIndex && opponentCharIndex === word.length && (
                <span className="typing-char-opponent inline-block w-0"></span>
              )}

              {/* Show cursor at end of completed current word */}
              {wordIndex === currentWordIndex && currentCharIndex === word.length && (
                <span className="typing-char-current inline-block w-0"></span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
};
