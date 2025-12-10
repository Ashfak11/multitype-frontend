import React from 'react';
import { cn } from '@/lib/utils';

interface WordDisplayProps {
  words: string[];
  currentWordIndex: number;
  currentCharIndex: number;
  typedChars: Map<string, 'correct' | 'incorrect' | 'extra'>;
}

export const WordDisplay: React.FC<WordDisplayProps> = ({
  words,
  currentWordIndex,
  currentCharIndex,
  typedChars,
}) => {
  return (
    <div className="font-mono text-2xl md:text-3xl leading-relaxed select-none">
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block mr-3 mb-2">
          {word.split('').map((char, charIndex) => {
            const charKey = `${wordIndex}-${charIndex}`;
            const charState = typedChars.get(charKey);
            const isCurrent = wordIndex === currentWordIndex && charIndex === currentCharIndex;
            const isPending = wordIndex > currentWordIndex || 
              (wordIndex === currentWordIndex && charIndex > currentCharIndex);
            const isTyped = charState !== undefined;

            return (
              <span
                key={charIndex}
                className={cn(
                  'typing-char relative',
                  isCurrent && 'typing-char-current',
                  !isCurrent && charState === 'correct' && 'typing-char-correct',
                  !isCurrent && charState === 'incorrect' && 'typing-char-incorrect',
                  !isCurrent && !isTyped && isPending && 'typing-char-pending'
                )}
              >
                {char}
              </span>
            );
          })}
          {/* Show cursor at end of completed current word */}
          {wordIndex === currentWordIndex && currentCharIndex === word.length && (
            <span className="typing-char-current">|</span>
          )}
        </span>
      ))}
    </div>
  );
};
