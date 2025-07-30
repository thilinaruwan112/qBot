
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Trash2, Loader2 } from "lucide-react";

type HistoricalDataCardProps = {
  historicalData: string[];
  onClear: () => void;
  isClearing: boolean;
};

export default function HistoricalDataCard({
  historicalData,
  onClear,
  isClearing,
}: HistoricalDataCardProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-6 w-6 text-primary" />
          <div className="space-y-1.5">
            <CardTitle>Historical Data</CardTitle>
            <CardDescription>
              All bet values recorded so far.
            </CardDescription>
          </div>
        </div>
         <Button variant="outline" size="sm" onClick={onClear} disabled={isClearing}>
            {isClearing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Trash2 className="mr-2 h-4 w-4" />
            )}
            Clear History
        </Button>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/50 p-4 rounded-md text-sm text-muted-foreground whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">
          {historicalData.length > 0 ? historicalData.join('x, ') + 'x' : "No historical data."}
        </div>
      </CardContent>
    </Card>
  );
}
