import React, { useEffect, useRef } from 'react';
import { WordDisplay } from './WordDisplay';
import { Stats } from './Stats';
import { useTypingTest } from '@/hooks/useTypingTest';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const TypingTest: React.FC = () => {
  const {
    words,
    currentWordIndex,
    currentCharIndex,
    typedChars,
    isActive,
    isFinished,
    timeLeft,
    wpm,
    accuracy,
    handleKeyPress,
    reset,
  } = useTypingTest();

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for space to avoid page scrolling
      if (e.key === ' ') {
        e.preventDefault();
      }
      
      // Ignore modifier keys alone
      if (['Shift', 'Control', 'Alt', 'Meta', 'Tab', 'Escape'].includes(e.key)) {
        return;
      }

      handleKeyPress(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress]);

  // Focus the container on mount
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  return (
    <div 
      ref={containerRef}
      className="w-full max-w-4xl mx-auto px-4 outline-none"
      tabIndex={0}
    >
      {/* Stats Bar */}
      <div className="mb-12">
        <Stats
          wpm={wpm}
          accuracy={accuracy}
          timeLeft={timeLeft}
          isActive={isActive}
          isFinished={isFinished}
        />
      </div>

      {/* Typing Area */}
      <div 
        className={cn(
          "relative p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 transition-all duration-300",
          isFinished && "opacity-50"
        )}
      >
        {/* Start hint */}
        {!isActive && !isFinished && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm rounded-xl z-10 animate-fade-in">
            <p className="text-muted-foreground text-lg">
              Start typing to begin...
            </p>
          </div>
        )}

        {/* Finished overlay */}
        {isFinished && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/90 backdrop-blur-sm rounded-xl z-10 animate-scale-in">
            <h2 className="text-3xl font-bold text-primary mb-2">Test Complete!</h2>
            <p className="text-muted-foreground text-lg mb-6">
              {wpm} WPM with {accuracy}% accuracy
            </p>
            <Button onClick={reset} variant="default" size="lg" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Try Again
            </Button>
          </div>
        )}

        <WordDisplay
          words={words.slice(0, 30)} // Show limited words for cleaner UI
          currentWordIndex={currentWordIndex}
          currentCharIndex={currentCharIndex}
          typedChars={typedChars}
        />
      </div>

      {/* Reset Button */}
      <div className="mt-8 flex justify-center">
        <Button 
          onClick={reset} 
          variant="ghost" 
          size="sm"
          className="text-muted-foreground hover:text-foreground gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>
    </div>
  );
};
