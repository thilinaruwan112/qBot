'use client';

import { useActionState } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import type { AnalyzeHighOddsOutput } from '@/ai/flows/analyze-high-odds';
import { getHighOddAnalysis } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { AppHeader } from '@/components/dashboard/header';
import DataInputCard from '@/components/dashboard/data-input-card';
import SignalCard from '@/components/dashboard/signal-card';
import AnalysisDetailsCard from '@/components/dashboard/analysis-details-card';
import { Loader2 } from 'lucide-react';

type State = {
  message: string;
  errors: Record<string, string[]> | null;
  analysisResult: AnalyzeHighOddsOutput | null;
};

const initialState: State = {
  message: '',
  errors: null,
  analysisResult: null,
};

export default function HighOddAnalyzerPage() {
  const [state, formAction, isPending] = useActionState(getHighOddAnalysis, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeHighOddsOutput | null>(null);

  useEffect(() => {
    if (state.message === 'Success' && state.analysisResult) {
      toast({
        title: 'Analysis Complete',
        description: 'High odd signal generated successfully.',
      });
      setAnalysisResult(state.analysisResult);
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
        <DataInputCard
            formRef={formRef}
            formAction={formAction}
            errors={state.errors}
            isPending={isPending}
        />

        {isPending && (
            <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )}

        {analysisResult && !isPending && (
            <div className="grid md:grid-cols-2 gap-8 items-start">
                <SignalCard analysisResult={analysisResult} />
                <AnalysisDetailsCard analysisDetails={analysisResult.analysisDetails} />
            </div>
        )}
      </main>
    </div>
  );
}
