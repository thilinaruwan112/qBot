"use client";

import { useMemo } from "react";
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
import { History } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { GameEvent } from "@/lib/types";

type GameEventsCardProps = {
  gameData: string;
};

export default function GameEventsCard({ gameData }: GameEventsCardProps) {
  const gameEvents = useMemo<GameEvent[]>(() => {
    if (!gameData) return [];
    try {
      const lines = gameData.trim().split("\n");
      const header = lines[0].split(",").map(h => h.trim());
      const crashPointIndex = header.indexOf("crash_point");
      const timestampIndex = header.indexOf("timestamp");

      if (crashPointIndex === -1 || timestampIndex === -1) return [];

      return lines
        .slice(1, 21)
        .map((line, index) => {
          const values = line.split(",");
          const crashPoint = parseFloat(values[crashPointIndex]);
          const timestamp = values[timestampIndex];
          if (isNaN(crashPoint) || !timestamp) return null;
          return {
            id: `event-${index}`,
            crashPoint,
            timestamp,
          };
        })
        .filter((event): event is GameEvent => event !== null);
    } catch (error) {
      console.error("Failed to parse game data:", error);
      return [];
    }
  }, [gameData]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <History className="h-6 w-6 text-primary" />
          <CardTitle>Game Event Monitor</CardTitle>
        </div>
        <CardDescription>A log of the last 20 game events from your data.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Crash Point</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gameEvents.length > 0 ? (
                gameEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className={event.crashPoint < 2.0 ? 'text-destructive' : 'text-green-500'}>
                        {event.crashPoint.toFixed(2)}x
                    </TableCell>
                    <TableCell>{new Date(event.timestamp).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">
                    No game data provided.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
