
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText } from "lucide-react";

type AnalysisDetailsCardProps = {
  analysisDetails: string;
};

export default function AnalysisDetailsCard({
  analysisDetails,
}: AnalysisDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <CardTitle>Analysis Details</CardTitle>
        </div>
        <CardDescription>
          The raw data extracted from your uploaded image.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/50 p-4 rounded-md text-sm text-muted-foreground whitespace-pre-wrap font-mono">
          {analysisDetails || "No data extracted."}
        </div>
      </CardContent>
    </Card>
  );
}
