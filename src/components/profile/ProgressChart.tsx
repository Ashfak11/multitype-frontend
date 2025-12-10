import React from 'react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { StoredTestResult } from '@/hooks/useTestHistory';

interface ProgressChartProps {
  results: StoredTestResult[];
  dataKey?: 'wpm' | 'accuracy';
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  results,
  dataKey = 'wpm',
}) => {
  const chartData = [...results]
    .slice(0, 20)
    .reverse()
    .map((result, index) => ({
      index: index + 1,
      wpm: result.wpm,
      accuracy: result.accuracy,
      date: new Date(result.timestamp).toLocaleDateString(),
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
        No data yet. Complete some tests to see your progress!
      </div>
    );
  }

  const gradientId = `gradient-${dataKey}`;
  const color = dataKey === 'wpm' ? 'hsl(35, 90%, 55%)' : 'hsl(145, 60%, 45%)';

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis 
          dataKey="index" 
          tick={{ fill: 'hsl(220, 10%, 45%)', fontSize: 12 }}
          axisLine={{ stroke: 'hsl(220, 15%, 20%)' }}
          tickLine={false}
        />
        <YAxis 
          tick={{ fill: 'hsl(220, 10%, 45%)', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          domain={dataKey === 'accuracy' ? [0, 100] : ['auto', 'auto']}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(220, 18%, 13%)',
            border: '1px solid hsl(220, 15%, 20%)',
            borderRadius: '8px',
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)',
          }}
          labelStyle={{ color: 'hsl(220, 10%, 85%)' }}
          itemStyle={{ color }}
          formatter={(value: number) => [
            dataKey === 'accuracy' ? `${value}%` : value,
            dataKey === 'wpm' ? 'WPM' : 'Accuracy'
          ]}
          labelFormatter={(label) => `Test #${label}`}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          animationDuration={1000}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
