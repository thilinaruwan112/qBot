"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  BarChart,
  ChevronDown,
  ChevronUp,
  Presentation,
  TableIcon,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import type { BetSuggestion } from "@/lib/types";

const mockBetData: BetSuggestion[] = [
  { position: 1.1, yield: 10, probability: 90, risk: "Low" },
  { position: 1.5, yield: 50, probability: 75, risk: "Low" },
  { position: 2.0, yield: 100, probability: 50, risk: "Medium" },
  { position: 3.5, yield: 250, probability: 30, risk: "Medium" },
  { position: 5.0, yield: 400, probability: 15, risk: "High" },
  { position: 10.0, yield: 900, probability: 5, risk: "High" },
];

const chartConfig = {
  yield: {
    label: "Yield",
  },
  low: {
    label: "Low Risk",
    color: "hsl(var(--chart-2))",
  },
  medium: {
    label: "Medium Risk",
    color: "hsl(var(--chart-4))",
  },
  high: {
    label: "High Risk",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

type SortKey = keyof BetSuggestion;

export default function BetVisualizerCard() {
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "ascending" | "descending";
  } | null>({ key: "position", direction: "ascending" });

  const sortedData = useMemo(() => {
    let sortableItems = [...mockBetData];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === "ascending" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const riskVariant = (risk: BetSuggestion["risk"]): "default" | "secondary" | "destructive" => {
    switch (risk) {
      case "Low":
        return "secondary";
      case "Medium":
        return "default";
      case "High":
        return "destructive";
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Presentation className="h-6 w-6 text-primary" />
          <CardTitle>Betting Visualizer</CardTitle>
        </div>
        <CardDescription>
          Interactive charts and tables based on AI analysis. (Using sample
          data)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chart">
              <BarChart className="h-4 w-4 mr-2" /> Chart
            </TabsTrigger>
            <TabsTrigger value="table">
              <TableIcon className="h-4 w-4 mr-2" /> Table
            </TabsTrigger>
          </TabsList>
          <TabsContent value="chart" className="mt-4">
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
              <RechartsBarChart
                accessibilityLayer
                data={mockBetData.map(d => ({...d, fill: `var(--color-${d.risk.toLowerCase()})`}))}
              >
                <XAxis
                  dataKey="position"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `${value}x`}
                />
                <YAxis
                  dataKey="yield"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="yield" radius={4} />
              </RechartsBarChart>
            </ChartContainer>
          </TabsContent>
          <TabsContent value="table" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => requestSort("position")}
                  >
                    <div className="flex items-center gap-1">
                      Position {getSortIcon("position")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => requestSort("yield")}
                  >
                     <div className="flex items-center gap-1">
                      Yield {getSortIcon("yield")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => requestSort("probability")}
                  >
                    <div className="flex items-center gap-1">
                      Probability {getSortIcon("probability")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => requestSort("risk")}
                  >
                    <div className="flex items-center gap-1">
                     Risk {getSortIcon("risk")}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((bet) => (
                  <TableRow key={bet.position}>
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
