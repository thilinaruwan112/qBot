
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText } from "lucide-react";

type ExtractedDataCardProps = {
  extractedData: string;
};

export default function ExtractedDataCard({
  extractedData,
}: ExtractedDataCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <CardTitle>Extracted Bet Values</CardTitle>
        </div>
        <CardDescription>
          The raw values extracted from your uploaded image.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/50 p-4 rounded-md text-sm text-muted-foreground whitespace-pre-wrap font-mono">
          {extractedData || "No data extracted."}
        </div>
      </CardContent>
    </Card>
  );
}
