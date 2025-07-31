'use client';

import { useActionState } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import type { AnalyzeHighOddsOutput } from '@/ai/flows/analyze-high-odds';
import { getHighOddAnalysis } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { AppHeader } from '@/components/dashboard/header';
import DataInputCard from '@/components/dashboard/data-input-card';
import SignalCard from '@/components/dashboard/signal-card';

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
  const [state, formAction] = useActionState(getHighOddAnalysis, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message === 'Success' && state.analysisResult) {
      toast({
        title: 'Analysis Complete',
        description: 'High odd signal generated successfully.',
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
        <DataInputCard
            formRef={formRef}
            formAction={formAction}
            errors={state.errors}
        />
        {state.analysisResult && (
            <div className="flex justify-center">
                <SignalCard analysisResult={state.analysisResult} />
            </div>
        )}
      </main>
    </div>
  );
}
