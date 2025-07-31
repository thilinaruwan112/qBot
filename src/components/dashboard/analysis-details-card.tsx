
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMemo } from "react";

type AnalysisDetailsCardProps = {
  analysisDetails: string;
};

type ParsedTableRow = {
  round: string;
  time: string;
  oddValue: string;
}

export default function AnalysisDetailsCard({
  analysisDetails,
}: AnalysisDetailsCardProps) {
  const parsedTable = useMemo(() => {
    if (!analysisDetails || !analysisDetails.includes('|')) return null;

    const lines = analysisDetails.trim().split('\n');
    if (lines.length < 3) return null; // Header, separator, at least one row

    const headers = lines[0].split('|').map(h => h.trim()).filter(Boolean);
    const dataRows = lines.slice(2);

    const roundIndex = headers.findIndex(h => h.toLowerCase().includes('round'));
    const timeIndex = headers.findIndex(h => h.toLowerCase().includes('time'));
    const oddIndex = headers.findIndex(h => h.toLowerCase().includes('odd'));
    
    if (roundIndex === -1 || timeIndex === -1 || oddIndex === -1) return null;

    const tableData = dataRows.map(row => {
        const cells = row.split('|').map(c => c.trim()).filter(Boolean);
        return {
            round: cells[roundIndex] || '',
            time: cells[timeIndex] || '',
            oddValue: cells[oddIndex] || '',
        } as ParsedTableRow
    });

    return tableData;

  }, [analysisDetails]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <CardTitle>Analysis Details</CardTitle>
        </div>
        <CardDescription>
          The raw data extracted and tabulated from your uploaded image(s).
        </CardDescription>
      </CardHeader>
      <CardContent>
        {parsedTable ? (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Round</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Odd Value</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {parsedTable.map((row, index) => (
                        <TableRow key={index}>
                            <TableCell>{row.round}</TableCell>
                            <TableCell>{row.time}</TableCell>
                            <TableCell className="font-mono">{row.oddValue}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        ) : (
          <div className="bg-muted/50 p-4 rounded-md text-sm text-muted-foreground whitespace-pre-wrap font-mono">
            {analysisDetails || "No data extracted."}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
