"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type SettingsCardProps = {
  gameData: string;
};

export default function SettingsCard({ gameData }: SettingsCardProps) {
  const { toast } = useToast();

  const handleExport = (format: "csv" | "json") => {
    if (!gameData) {
      toast({
        title: "Export Failed",
        description: "There is no data to export.",
        variant: "destructive",
      });
      return;
    }

    let blob;
    let filename;

    try {
        if (format === 'csv') {
            blob = new Blob([gameData], { type: 'text/csv;charset=utf-8;' });
            filename = 'skybet-data.csv';
        } else {
            const lines = gameData.trim().split('\n');
            const headers = lines[0].split(',').map(h => h.trim());
            const json = lines.slice(1).map(line => {
                const values = line.split(',');
                return headers.reduce((obj, header, i) => {
                    (obj as any)[header] = values[i] ? values[i].trim() : null;
                    return obj;
                }, {});
            });
            blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json;charset=utf-8;' });
            filename = 'skybet-data.json';
        }
    
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    
        toast({
            title: "Export Successful",
            description: `Data exported as ${filename}`
        });

    } catch (error) {
        toast({
            title: "Export Failed",
            description: "Could not convert data to JSON. Please check the CSV format.",
            variant: "destructive"
        })
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          <CardTitle>Settings & Export</CardTitle>
        </div>
        <CardDescription>Customize appearance and export your data.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="logo-url">Custom Logo URL</Label>
            <Input id="logo-url" placeholder="https://example.com/logo.png" />
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport('csv')} className="w-full">
                <Download className="mr-2 h-4 w-4"/>
                Export CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport('json')} className="w-full">
                <Download className="mr-2 h-4 w-4"/>
                Export JSON
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
