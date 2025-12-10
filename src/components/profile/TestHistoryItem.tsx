import React from 'react';
import { Clock, Target, Zap, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StoredTestResult } from '@/hooks/useTestHistory';

interface TestHistoryItemProps {
  result: StoredTestResult;
  delay?: number;
}

export const TestHistoryItem: React.FC<TestHistoryItemProps> = ({
  result,
  delay = 0,
}) => {
  const date = new Date(result.timestamp);
  const timeAgo = getTimeAgo(date);

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl bg-card/30 border border-border/30",
        "hover:bg-card/50 hover:border-border/50 transition-all duration-200"
      )}
      style={{
        animation: `fade-slide-in 0.3s ease-out ${delay}ms both`,
      }}
    >
      {/* Time indicator */}
      <div className="flex flex-col items-center text-center min-w-[60px]">
        <Calendar className="w-4 h-4 text-muted-foreground mb-1" />
        <span className="text-xs text-muted-foreground">{timeAgo}</span>
      </div>

      {/* Vertical divider */}
      <div className="w-px h-12 bg-border/50" />

      {/* Stats */}
      <div className="flex-1 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <div>
            <span className="text-lg font-mono font-bold">{result.wpm}</span>
            <span className="text-xs text-muted-foreground ml-1">wpm</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Target className={cn(
            "w-4 h-4",
            result.accuracy >= 95 ? "text-success" : "text-muted-foreground"
          )} />
          <span className={cn(
            "font-mono",
            result.accuracy >= 95 && "text-success"
          )}>
            {result.accuracy}%
          </span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="text-sm">{result.config.duration}s</span>
        </div>
      </div>

      {/* Config badge */}
      <div className="px-3 py-1 rounded-full bg-secondary/50 text-xs text-secondary-foreground capitalize">
        {result.config.difficulty}
      </div>
    </div>
  );
};

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
