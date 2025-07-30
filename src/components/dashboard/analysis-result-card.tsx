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
  colorPatternAnalysis: string;
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

    let titleIndex = findSectionIndex("Aviator Data Intelligence Report");
    
    // Fallback for title if the main one isn't found
    if (titleIndex === -1) {
       titleIndex = 0; // Assume first line is title if specific title not found
    }

    const colorPatternIndex = findSectionIndex("Color Pattern Analysis");
    const bettingSuggestionIndex = findSectionIndex("Betting Suggestion");

    
    const getSectionContent = (startIndex: number, endIndex: number) => {
        if (startIndex === -1) return '';
        // Determine the slice end, considering if the next section exists
        const sliceEnd = endIndex !== -1 ? endIndex : undefined;
        let contentLines = lines.slice(startIndex, sliceEnd);
        
        // Remove the title line itself from the content, if it exists
        if (contentLines.length > 0 && contentLines[0].toLowerCase().startsWith(lines[startIndex].toLowerCase().split(':')[0])) {
            contentLines.shift();
        }
        
        return contentLines.join('\n').trim();
    };

    const title = lines[titleIndex] || "AI Analysis Report";
    const colorPatternAnalysis = getSectionContent(colorPatternIndex, bettingSuggestionIndex);
    const bettingSuggestion = getSectionContent(bettingSuggestionIndex, -1); // -1 means to the end

    // If parsing fails to find specific sections, show the whole text.
    if (!colorPatternAnalysis && !bettingSuggestion) {
      return {
        title: "AI Analysis Report",
        colorPatternAnalysis: analysisResult.analysis,
        bettingSuggestion: "",
      }
    }

    return {
      title,
      colorPatternAnalysis,
      bettingSuggestion,
    };
  }, [analysisResult.analysis]);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <CardTitle>AI Analysis Result</CardTitle>
        </div>
        <CardDescription>
          Insights generated from your game data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
        {parsedAnalysis ? (
           <div className="space-y-6 text-sm">
            <h3 className="text-lg font-semibold text-foreground">{parsedAnalysis.title}</h3>

            {parsedAnalysis.colorPatternAnalysis && (
              <div className="space-y-2">
                <h4 className="font-semibold text-base">Color Pattern Analysis</h4>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{parsedAnalysis.colorPatternAnalysis}</p>
              </div>
            )}
            
            {parsedAnalysis.bettingSuggestion && (
              <div className="space-y-2">
                <h4 className="font-semibold text-base">Betting Suggestion</h4>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{parsedAnalysis.bettingSuggestion}</p>
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
          <h3 className="font-semibold mb-2 text-base">Suggested Bet Positions</h3>
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
