import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Zap, 
  Target, 
  Clock, 
  TrendingUp,
  BarChart3,
  History,
  Award,
  Trash2
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/profile/StatCard';
import { ProgressChart } from '@/components/profile/ProgressChart';
import { PersonalBestCard } from '@/components/profile/PersonalBestCard';
import { TestHistoryItem } from '@/components/profile/TestHistoryItem';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useTestHistory } from '@/hooks/useTestHistory';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const Profile: React.FC = () => {
  const { results, stats, personalBests, clearHistory } = useTestHistory();
  const [chartView, setChartView] = useState<'wpm' | 'accuracy'>('wpm');

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const highestPB = personalBests.reduce((a, b) => a.wpm > b.wpm ? a : b);

  const handleClearHistory = () => {
    clearHistory();
    toast.success('History cleared successfully');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to typing
        </Link>

        {/* Profile header */}
        <div className="flex items-start justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-success flex items-center justify-center">
                <Award className="w-3 h-3 text-success-foreground" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Your Profile</h1>
              <p className="text-muted-foreground">
                {stats.totalTests} tests completed
              </p>
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear History
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all history?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your test results and statistics. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearHistory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Clear All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Stats overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard
            icon={Zap}
            label="Best WPM"
            value={stats.bestWpm}
            delay={0}
          />
          <StatCard
            icon={TrendingUp}
            label="Average WPM"
            value={stats.avgWpm}
            delay={100}
          />
          <StatCard
            icon={Target}
            label="Avg Accuracy"
            value={`${stats.avgAccuracy}%`}
            delay={200}
          />
          <StatCard
            icon={Clock}
            label="Time Typed"
            value={formatTime(stats.totalTimeTyped)}
            delay={300}
          />
        </div>

        {/* Personal Bests */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Personal Bests</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {personalBests.map((pb, index) => (
              <PersonalBestCard
                key={pb.duration}
                duration={pb.duration}
                wpm={pb.wpm}
                accuracy={pb.accuracy}
                date={pb.date}
                isHighest={pb.duration === highestPB.duration && pb.wpm > 0}
                delay={index * 100}
              />
            ))}
          </div>
        </section>

        {/* Progress Chart */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Progress</h2>
            </div>
            <Tabs value={chartView} onValueChange={(v) => setChartView(v as 'wpm' | 'accuracy')}>
              <TabsList className="bg-secondary/30">
                <TabsTrigger value="wpm" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  WPM
                </TabsTrigger>
                <TabsTrigger value="accuracy" className="data-[state=active]:bg-success data-[state=active]:text-success-foreground">
                  Accuracy
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="p-6 rounded-2xl bg-card/50 border border-border/50">
            <ProgressChart results={results} dataKey={chartView} />
          </div>
        </section>

        {/* Test History */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Recent Tests</h2>
          </div>
          <div className="space-y-2">
            {results.length > 0 ? (
              results.slice(0, 10).map((result, index) => (
                <TestHistoryItem
                  key={result.id}
                  result={result}
                  delay={index * 50}
                />
              ))
            ) : (
              <div className="text-center py-12 rounded-2xl bg-card/30 border border-dashed border-border/30">
                <History className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No tests completed yet</p>
                <Link to="/" className="text-primary hover:underline text-sm">
                  Start your first test →
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/3 -right-32 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -left-32 w-64 h-64 bg-success/5 rounded-full blur-3xl" />
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes scale-fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
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

export default Profile;
