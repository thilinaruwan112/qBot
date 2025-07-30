
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type PredictionsCardProps = {
  predictions: number[];
};

export default function PredictionsCard({
  predictions,
}: PredictionsCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <CardTitle>Next 10 Rounds Prediction</CardTitle>
        </div>
        <CardDescription>
          The AI's prediction for the upcoming game multipliers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {predictions && predictions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {predictions.map((prediction, index) => (
              <Badge key={index} variant={prediction > 10 ? "destructive" : (prediction > 2 ? "default" : "secondary")} className="text-lg font-bold p-2">
                {prediction.toFixed(2)}x
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No predictions available at this moment.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
