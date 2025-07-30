"use client";

import type { AnalyzeBettingPatternsOutput } from "@/ai/flows/analyze-betting-patterns";
import type { BetSuggestion } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit } from "lucide-react";

type AnalysisResultCardProps = {
  analysisResult: AnalyzeBettingPatternsOutput;
};

export default function AnalysisResultCard({
  analysisResult,
}: AnalysisResultCardProps) {
  const riskVariant = (
    risk: BetSuggestion["risk"]
  ): "default" | "secondary" | "destructive" => {
    switch (risk) {
      case "Low":
        return "secondary";
      case "Medium":
        return "default";
      case "High":
        return "destructive";
    }
  };
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
          {Array.isArray(analysisResult.suggestedBetPositions) &&
          analysisResult.suggestedBetPositions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Yield</TableHead>
                  <TableHead>Probability</TableHead>
                  <TableHead>Risk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysisResult.suggestedBetPositions.map((bet, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{bet.position}x</TableCell>
                    <TableCell>{bet.yield}</TableCell>
                    <TableCell>{bet.probability}%</TableCell>
                    <TableCell>
                      <Badge variant={riskVariant(bet.risk)}>{bet.risk}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">
              No bet suggestions available.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
