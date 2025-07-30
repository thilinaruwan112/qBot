
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Database } from "lucide-react";

type HistoricalDataCardProps = {
  historicalData: string[];
};

export default function HistoricalDataCard({
  historicalData,
}: HistoricalDataCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="h-6 w-6 text-primary" />
          <CardTitle>Historical Data</CardTitle>
        </div>
        <CardDescription>
          All bet values recorded so far.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/50 p-4 rounded-md text-sm text-muted-foreground whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">
          {historicalData.length > 0 ? historicalData.join('x, ') + 'x' : "No historical data."}
        </div>
      </CardContent>
    </Card>
  );
}
