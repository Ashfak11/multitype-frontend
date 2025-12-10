import React from 'react';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { LeaderboardScore } from '@/hooks/useLeaderboard';

interface LeaderboardCardProps {
  score: LeaderboardScore & { rank: number };
  isCurrentUser?: boolean;
  animationDelay?: number;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="w-6 h-6 text-yellow-400" />;
    case 2:
      return <Medal className="w-6 h-6 text-gray-300" />;
    case 3:
      return <Award className="w-6 h-6 text-amber-600" />;
    default:
      return null;
  }
};

const getRankStyle = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border-yellow-500/30 shadow-yellow-500/10';
    case 2:
      return 'bg-gradient-to-r from-gray-400/15 to-gray-300/5 border-gray-400/20';
    case 3:
      return 'bg-gradient-to-r from-amber-600/15 to-orange-500/5 border-amber-600/20';
    default:
      return 'bg-card/50 border-border/50 hover:border-primary/30';
  }
};

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  score,
  isCurrentUser = false,
  animationDelay = 0,
}) => {
  const rankIcon = getRankIcon(score.rank);
  const rankStyle = getRankStyle(score.rank);

  return (
    <div
      className={cn(
        "relative flex items-center gap-4 p-4 rounded-xl border backdrop-blur-sm transition-all duration-300",
        "hover:scale-[1.02] hover:shadow-lg",
        rankStyle,
        isCurrentUser && "ring-2 ring-primary/50"
      )}
      style={{
        animation: `fade-slide-in 0.4s ease-out ${animationDelay}ms both`,
      }}
    >
      {/* Rank */}
      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-secondary/50">
        {rankIcon || (
          <span className={cn(
            "text-xl font-bold font-mono",
            score.rank <= 10 ? "text-primary" : "text-muted-foreground"
          )}>
            {score.rank}
          </span>
        )}
      </div>

      {/* User Info */}
      <div className="flex items-center gap-3 flex-1">
        <Avatar className="w-10 h-10 border-2 border-border">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {score.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className={cn(
            "font-semibold",
            isCurrentUser && "text-primary"
          )}>
            {score.username}
            {isCurrentUser && <span className="ml-2 text-xs text-primary">(You)</span>}
          </p>
          <p className="text-xs text-muted-foreground">
            {score.duration}s test • {new Date(score.timestamp).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="flex items-center gap-1 justify-end">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-2xl font-mono font-bold text-foreground">
              {score.wpm}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">WPM</p>
        </div>
        
        <div className="text-right min-w-[60px]">
          <span className={cn(
            "text-lg font-mono font-semibold",
            score.accuracy >= 95 && "text-success",
            score.accuracy < 90 && "text-muted-foreground"
          )}>
            {score.accuracy}%
          </span>
          <p className="text-xs text-muted-foreground">Accuracy</p>
        </div>
      </div>

      {/* Top 3 glow effect */}
      {score.rank <= 3 && (
        <div className={cn(
          "absolute inset-0 rounded-xl opacity-30 blur-xl -z-10",
          score.rank === 1 && "bg-yellow-500",
          score.rank === 2 && "bg-gray-400",
          score.rank === 3 && "bg-amber-600"
        )} />
      )}
    </div>
  );
};
