'use client';

import { useActionState } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import type { AnalyzeHighOddsOutput } from '@/ai/flows/analyze-high-odds';
import { getHighOddAnalysis } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { AppHeader } from '@/components/dashboard/header';
import DataInputCard from '@/components/dashboard/data-input-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Signal, FileText } from 'lucide-react';

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

function HighOddAnalysisResult({ analysisResult }: { analysisResult: AnalyzeHighOddsOutput }) {
    const { extractedData, analysisSignal } = analysisResult;
  
    return (
      <div className="grid gap-4 md:grid-cols-2 md:gap-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <CardTitle>Extracted Round Data</CardTitle>
            </div>
            <CardDescription>
              Data extracted from the "Provably Fair" screenshot.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Round ID:</span>
              <span>{extractedData.roundId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Result Odd:</span>
              <span className="font-semibold">{extractedData.resultOdd}x</span>
            </div>
            <div className="space-y-1">
                <p className="text-muted-foreground">Server Seed:</p>
                <p className="break-all bg-muted/50 p-2 rounded-md">{extractedData.serverSeed}</p>
            </div>
             <div className="space-y-1">
                <p className="text-muted-foreground">Client Seed:</p>
                <p className="break-all bg-muted/50 p-2 rounded-md">{extractedData.clientSeed}</p>
            </div>
             <div className="space-y-1">
                <p className="text-muted-foreground">Combined Hash:</p>
                <p className="break-all bg-muted/50 p-2 rounded-md">{extractedData.combinedHash}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Signal className="h-6 w-6 text-primary" />
              <CardTitle>Analysis Signal</CardTitle>
            </div>
            <CardDescription>
              Strategic insight based on the round's data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {analysisSignal}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

export default function HighOddAnalyzerPage() {
  const [state, formAction] = useActionState(getHighOddAnalysis, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message === 'Success' && state.analysisResult) {
      toast({
        title: 'Analysis Complete',
        description: 'High odd data analyzed successfully.',
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
            <HighOddAnalysisResult analysisResult={state.analysisResult} />
        )}
      </main>
    </div>
  );
}
