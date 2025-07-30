'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { History } from 'lucide-react';
import type { GameEvent } from '@/lib/types';

type CrashHistoryChartProps = {
  gameData: string;
};

export default function CrashHistoryChart({ gameData }: CrashHistoryChartProps) {
  const chartData = useMemo<GameEvent[]>(() => {
    if (!gameData) return [];
    try {
      const cleanedData = gameData.replace(/Round History/i, '').trim();
      const crashPoints = cleanedData.match(/[\d.]+(?=x)/g) || [];

      return crashPoints
        .slice(0, 20)
        .reverse()
        .map((crashPointStr, index) => {
          const crashPoint = parseFloat(crashPointStr);
          if (isNaN(crashPoint)) return null;
          return {
            id: `event-${index}`,
            crashPoint,
            name: `Round ${index + 1}`,
          };
        })
        .filter((event): event is GameEvent => event !== null);
    } catch (error) {
      console.error('Failed to parse game data for chart:', error);
      return [];
    }
  }, [gameData]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <History className="h-6 w-6 text-primary" />
          <CardTitle>Crash History Visualizer</CardTitle>
        </div>
        <CardDescription>
          A bar chart of the last 20 crash points from your data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                itemStyle={{ color: 'hsl(var(--primary))' }}
                formatter={(value: number) => [`${value.toFixed(2)}x`, 'Crash Point']}
              />
              <Bar dataKey="crashPoint" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No game data to display. Upload data to see the chart.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
