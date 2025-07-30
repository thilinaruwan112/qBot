"use client";

import type { AnalyzeBettingPatternsOutput } from "@/ai/flows/analyze-betting-patterns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BrainCircuit } from "lucide-react";

type AnalysisResultCardProps = {
  analysisResult: AnalyzeBettingPatternsOutput;
};

export default function AnalysisResultCard({
  analysisResult,
}: AnalysisResultCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <CardTitle>AI Analysis Result</CardTitle>
        </div>
        <CardDescription>
          Insights generated from your game data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Betting Pattern Analysis</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {analysisResult.analysis}
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Suggested Bet Positions</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {analysisResult.suggestedBetPositions}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
