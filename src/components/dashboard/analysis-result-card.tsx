"use client";

import type { AnalyzeBettingPatternsOutput } from "@/ai/flows/analyze-betting-patterns";
import type { BetSuggestion } from "@/lib/types";
import { useMemo } from 'react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";

type AnalysisResultCardProps = {
  analysisResult: AnalyzeBettingPatternsOutput;
};

type ParsedAnalysis = {
  title: string;
  multiplierTrendAnalysis: string;
  statisticalInsights: string;
  bettingSuggestion: string;
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

  const parsedAnalysis: ParsedAnalysis | null = useMemo(() => {
    if (!analysisResult.analysis) return null;

    const lines = analysisResult.analysis.split('\n').filter(line => line.trim() !== '');
    
    const findSectionIndex = (keyword: string) => lines.findIndex(line => line.toLowerCase().startsWith(keyword.toLowerCase()));

    const titleIndex = findSectionIndex("Aviator Data Intelligence Report");
    const multiplierTrendIndex = findSectionIndex("Multiplier Trend Analysis");
    const statisticalInsightsIndex = findSectionIndex("Statistical Insights");
    const bettingSuggestionIndex = findSectionIndex("Betting Suggestion");

    if (titleIndex === -1) return null;
    
    const getSectionContent = (startIndex: number, endIndex: number) => {
        if (startIndex === -1) return '';
        const contentLines = lines.slice(startIndex, endIndex === -1 ? undefined : endIndex);
        // Remove the title line itself from the content
        contentLines.shift();
        return contentLines.join('\n').trim();
    };

    return {
      title: lines[titleIndex],
      multiplierTrendAnalysis: getSectionContent(multiplierTrendIndex, statisticalInsightsIndex),
      statisticalInsights: getSectionContent(statisticalInsightsIndex, bettingSuggestionIndex),
      bettingSuggestion: getSectionContent(bettingSuggestionIndex, -1),
    };
  }, [analysisResult.analysis]);

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
        {parsedAnalysis ? (
           <div className="space-y-6 text-sm">
            <h3 className="text-lg font-semibold text-foreground">{parsedAnalysis.title}</h3>

            {parsedAnalysis.multiplierTrendAnalysis && (
              <div className="space-y-2">
                <h4 className="font-semibold">Multiplier Trend Analysis</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">{parsedAnalysis.multiplierTrendAnalysis}</p>
              </div>
            )}

            {parsedAnalysis.statisticalInsights && (
              <div className="space-y-2">
                <h4 className="font-semibold">Statistical Insights</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">{parsedAnalysis.statisticalInsights}</p>
              </div>
            )}
            
            {parsedAnalysis.bettingSuggestion && (
              <div className="space-y-2">
                <h4 className="font-semibold">Betting Suggestion</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">{parsedAnalysis.bettingSuggestion}</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h3 className="font-semibold mb-2">Betting Pattern Analysis</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {analysisResult.analysis}
            </p>
          </div>
        )}

        <Separator />
        
        <div>
          <h3 className="font-semibold mb-2">Suggested Bet Positions</h3>
          {Array.isArray(analysisResult.suggestedBetPositions) &&
          analysisResult.suggestedBetPositions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      Yield
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>The potential multiplier for your bet if you win.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableHead>
                  <TableHead>Probability</TableHead>
                  <TableHead>Risk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysisResult.suggestedBetPositions.map((bet, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{bet.position}x</TableCell>
                    <TableCell>{bet.yield}x</TableCell>
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
