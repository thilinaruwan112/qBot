'use client';

import { useFormState } from 'react-dom';
import React, { useEffect, useRef, useState, useTransition } from 'react';
import type { AnalyzeBettingPatternsOutput } from '@/ai/flows/analyze-betting-patterns';
import { getBettingAnalysis, clearHistoricalData } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { AppHeader } from '@/components/dashboard/header';
import DataInputCard from '@/components/dashboard/data-input-card';
import AnalysisResultCard from '@/components/dashboard/analysis-result-card';
import CrashHistoryChart from '@/components/dashboard/crash-history-chart';
import ExtractedDataCard from '@/components/dashboard/extracted-data-card';
import HistoricalDataCard from '@/components/dashboard/historical-data-card';

type State = {
  message: string;
  errors: Record<string, string[]> | null;
  analysisResult: AnalyzeBettingPatternsOutput | null;
  historicalData?: string[];
};

const initialState: State = {
  message: '',
  errors: null,
  analysisResult: null,
  historicalData: [],
};

export default function HomePage() {
  const [state, formAction] = useFormState(getBettingAnalysis, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const [gameData, setGameData] = useState('');
  const [historicalData, setHistoricalData] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (state.analysisResult?.extractedData) {
      setGameData(state.analysisResult.extractedData);
    }
    if (state.historicalData) {
      setHistoricalData(state.historicalData);
    } else {
      // This handles the case where the initial load has no historical data
      // or it gets cleared.
      setHistoricalData([]);
    }
  }, [state.analysisResult?.extractedData, state.historicalData]);

  useEffect(() => {
    if (state.message === 'Success' && state.analysisResult) {
      toast({
        title: 'Analysis Complete',
        description: 'Betting patterns analyzed successfully.',
      });
      if (formRef.current) {
        formRef.current.reset();
      }
    } else if (state.message && state.message !== 'Success') {
      toast({
        title: 'Analysis Failed',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  const handleClearHistory = () => {
    startTransition(async () => {
      const result = await clearHistoricalData();
      if (result.success) {
        setHistoricalData([]);
        setGameData('');
        // Reset analysis state as well
        // A bit of a hack to reset the form state, but it works
        (formRef.current as any)?.reset(); // clear file input
        const emptyState: State = { ...initialState, historicalData: [] };
        // This is tricky without a dedicated state setter from useFormState
        // for now we just clear our local state
        // A page reload or new analysis will sync everything correctly.
        // To properly reset the `state` from `useFormState` is more complex.
        // For our purpose, clearing local state is sufficient.
        state.analysisResult = null;
        state.message = '';
        state.errors = null;

        toast({
          title: 'History Cleared',
          description: 'Your betting history has been cleared.',
        });
      } else {
        toast({
          title: 'Error Clearing History',
          description: result.message,
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8">
          <div className="flex flex-col gap-4">
            <DataInputCard
              formRef={formRef}
              formAction={formAction}
              errors={state.errors}
            />
             {state.analysisResult && (
              <ExtractedDataCard extractedData={state.analysisResult.extractedData} />
            )}
            {historicalData.length > 0 && (
                <HistoricalDataCard 
                  historicalData={historicalData} 
                  onClear={handleClearHistory}
                  isClearing={isPending}
                />
            )}
            <CrashHistoryChart gameData={gameData} />
          </div>
          <div className="flex flex-col gap-4">
            {state.analysisResult && (
                <AnalysisResultCard analysisResult={state.analysisResult} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
