'use client';

import { useActionState } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import type { AnalyzeBettingPatternsOutput } from '@/ai/flows/analyze-betting-patterns';
import { getBettingAnalysis } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { AppHeader } from '@/components/dashboard/header';
import DataInputCard from '@/components/dashboard/data-input-card';
import AnalysisResultCard from '@/components/dashboard/analysis-result-card';
import ExtractedDataCard from '@/components/dashboard/extracted-data-card';
import PredictionsCard from '@/components/dashboard/predictions-card';
import BettingLogCard from '@/components/dashboard/betting-log-card';
import { BetLogEntry } from '@/lib/types';

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
  const [state, formAction] = useActionState(getBettingAnalysis, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [betLog, setBetLog] = useState<BetLogEntry[]>([]);

  useEffect(() => {
    if (state.message === 'Success' && state.analysisResult) {
      toast({
        title: 'Analysis Complete',
        description: 'Betting patterns analyzed successfully.',
      });
      if (formRef.current) {
        formRef.current.reset();
      }
      if(state.analysisResult.predictions) {
        setBetLog(state.analysisResult.predictions.map((prediction, index) => ({
            id: index,
            predictedValue: prediction,
            stake: 0,
            actualOdd: prediction,
        })));
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
          </div>
          <div className="flex flex-col gap-4">
            {state.analysisResult && (
                <AnalysisResultCard analysisResult={state.analysisResult} />
            )}
             {state.analysisResult?.predictions && state.analysisResult.predictions.length > 0 && (
              <PredictionsCard predictions={state.analysisResult.predictions} />
            )}
          </div>
        </div>
        {state.analysisResult?.predictions && state.analysisResult.predictions.length > 0 && (
            <BettingLogCard betLog={betLog} setBetLog={setBetLog} />
        )}
      </main>
    </div>
  );
}
