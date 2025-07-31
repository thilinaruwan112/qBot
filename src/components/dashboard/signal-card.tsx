"use client";

import type { AnalyzeHighOddsOutput } from '@/ai/flows/analyze-high-odds';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Target, TrendingUp, AlertTriangle, Pin } from 'lucide-react';

type SignalCardProps = {
  analysisResult: AnalyzeHighOddsOutput;
};

const SignalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
        <path d="M14.5 15.5 18 2l-3.5 10.5h-1L9 2l-3.5 14h10Z"/>
    </svg>
);


export default function SignalCard({ analysisResult }: SignalCardProps) {
  const { signalTime, timeRange, duration, expectedTarget, riskLevel } = analysisResult;

  const getIcon = (title: string) => {
    switch (title.toLowerCase()) {
      case 'signal time':
        return <Clock className="h-6 w-6 text-blue-500" />;
      case 'duration':
        return <Pin className="h-6 w-6 text-red-500" />;
      case 'expected target':
        return <TrendingUp className="h-6 w-6 text-green-500" />;
      case 'risk level':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      default:
        return <SignalIcon />;
    }
  };
  
  const parseTitle = (title: string) => {
    if (title.includes('(')) {
        return title.substring(0, title.indexOf('(')).trim();
    }
    return title;
  }

  const signalItems = [
    { title: signalTime, value: timeRange },
    { title: 'Duration', value: duration },
    { title: 'Expected Target', value: expectedTarget },
    { title: 'Risk Level', value: riskLevel },
  ];

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <SignalIcon />
            High-Odd Signal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {signalItems.map((item, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="flex-shrink-0">
                {getIcon(item.title.toLowerCase())}
            </div>
            <div className="flex-grow">
              <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
              <p className="text-lg font-semibold">{item.value}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
