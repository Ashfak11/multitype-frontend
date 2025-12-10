import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy, Filter, Sparkles } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { LeaderboardCard } from '@/components/leaderboard/LeaderboardCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import type { LeaderboardPeriod, TestDuration } from '@/types';

const periodLabels: Record<LeaderboardPeriod, string> = {
  daily: 'Today',
  weekly: 'This Week',
  monthly: 'This Month',
  allTime: 'All Time',
};

const durationOptions: (TestDuration | 'all')[] = ['all', 15, 30, 60, 120];

const Leaderboard: React.FC = () => {
  const [period, setPeriod] = useState<LeaderboardPeriod>('weekly');
  const [duration, setDuration] = useState<TestDuration | 'all'>('all');
  const { getFilteredScores } = useLeaderboard();

  const scores = useMemo(() => {
    return getFilteredScores(
      period,
      duration === 'all' ? undefined : duration
    );
  }, [period, duration, getFilteredScores]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to typing
        </Link>

        {/* Hero section */}
        <div className="relative mb-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-500/10 border border-yellow-500/20">
              <Trophy className="w-8 h-8 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Leaderboard</h1>
              <p className="text-muted-foreground">See how you stack up against other typists</p>
            </div>
          </div>

          {/* Decorative sparkle */}
          <Sparkles className="absolute right-0 top-0 w-6 h-6 text-primary/30 animate-pulse" />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Tabs value={period} onValueChange={(v) => setPeriod(v as LeaderboardPeriod)} className="w-full sm:w-auto">
            <TabsList className="grid grid-cols-4 bg-secondary/30">
              {Object.entries(periodLabels).map(([key, label]) => (
                <TabsTrigger 
                  key={key} 
                  value={key}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <div className="flex gap-1">
              {durationOptions.map((d) => (
                <Button
                  key={d}
                  variant={duration === d ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setDuration(d)}
                  className="text-xs px-3"
                >
                  {d === 'all' ? 'All' : `${d}s`}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboard list */}
        <div className="space-y-3">
          {scores.length > 0 ? (
            scores.map((score, index) => (
              <LeaderboardCard
                key={score.id}
                score={score}
                animationDelay={index * 50}
              />
            ))
          ) : (
            <div className="text-center py-16">
              <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No scores yet for this period</p>
              <p className="text-sm text-muted-foreground/70">Complete a test to get on the board!</p>
            </div>
          )}
        </div>
      </main>

      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl" />
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes fade-slide-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Leaderboard;
