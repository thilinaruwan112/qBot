'use client';

import { useFormState } from 'react-dom';
import React, { useEffect, useRef, useState } from 'react';
import type { AnalyzeBettingPatternsOutput } from '@/ai/flows/analyze-betting-patterns';
import { getBettingAnalysis } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { AppHeader } from '@/components/dashboard/header';
import DataInputCard from '@/components/dashboard/data-input-card';
import AnalysisResultCard from '@/components/dashboard/analysis-result-card';
import CrashHistoryChart from '@/components/dashboard/crash-history-chart';
import ExtractedDataCard from '@/components/dashboard/extracted-data-card';

type State = {
  message: string;
  errors: Record<string, string[]> | null;
  analysisResult: AnalyzeBettingPatternsOutput | null;
};

const initialState: State = {
  message: '',
  errors: null,
  analysisResult: null,
};

export default function HomePage() {
  const [state, formAction] = useFormState(getBettingAnalysis, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const [gameData, setGameData] = useState('');

  useEffect(() => {
    if (state.analysisResult?.extractedData) {
      setGameData(state.analysisResult.extractedData);
    }
  }, [state.analysisResult?.extractedData]);

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
