import React from 'react';
import { Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PersonalBestCardProps {
  duration: number;
  wpm: number;
  accuracy: number;
  date: string | null;
  isHighest?: boolean;
  delay?: number;
}

export const PersonalBestCard: React.FC<PersonalBestCardProps> = ({
  duration,
  wpm,
  accuracy,
  date,
  isHighest = false,
  delay = 0,
}) => {
  const hasData = wpm > 0;

  return (
    <div
      className={cn(
        "relative p-5 rounded-xl border transition-all duration-300",
        "hover:scale-105 hover:shadow-lg",
        hasData 
          ? "bg-card/50 border-border/50 hover:border-primary/30" 
          : "bg-muted/20 border-dashed border-border/30",
        isHighest && hasData && "ring-2 ring-primary/30 border-primary/30"
      )}
      style={{
        animation: `scale-fade-in 0.4s ease-out ${delay}ms both`,
      }}
    >
      {isHighest && hasData && (
        <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
          Best
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        <Clock className={cn(
          "w-4 h-4",
          hasData ? "text-primary" : "text-muted-foreground/50"
        )} />
        <span className="font-mono font-semibold text-foreground">{duration}s</span>
      </div>

      {hasData ? (
        <>
          <div className="flex items-baseline gap-1 mb-1">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-3xl font-mono font-bold text-foreground">{wpm}</span>
            <span className="text-sm text-muted-foreground">wpm</span>
          </div>
          <p className={cn(
            "text-sm font-mono",
            accuracy >= 95 ? "text-success" : "text-muted-foreground"
          )}>
            {accuracy}% accuracy
          </p>
          {date && (
            <p className="text-xs text-muted-foreground/70 mt-2">
              {new Date(date).toLocaleDateString()}
            </p>
          )}
        </>
      ) : (
        <div className="text-center py-4">
          <p className="text-muted-foreground/50 text-sm">No record yet</p>
        </div>
      )}

      {/* Glow effect for highest */}
      {isHighest && hasData && (
        <div className="absolute inset-0 rounded-xl bg-primary/10 blur-xl -z-10" />
      )}
    </div>
  );
};
