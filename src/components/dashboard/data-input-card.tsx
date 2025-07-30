"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

type DataInputCardProps = {
  formRef: React.RefObject<HTMLFormElement>;
  formAction: (payload: FormData) => void;
  errors: Record<string, string[]> | null | undefined;
  onTextareaChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <UploadCloud className="mr-2 h-4 w-4" />
            )}
            Analyze Data
        </Button>
    )
}

export default function DataInputCard({
  formRef,
  formAction,
  errors,
  onTextareaChange,
}: DataInputCardProps) {

  return (
    <Card>
      <form ref={formRef} action={formAction}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UploadCloud className="h-6 w-6 text-primary" />
            <CardTitle>Upload Game Data</CardTitle>
          </div>
          <CardDescription>
            Paste your historical game data (e.g., in CSV format) below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            name="gameData"
            placeholder="crash_point,timestamp
1.23,2023-10-27T10:00:00Z
2.45,2023-10-27T10:01:00Z
1.01,2023-10-27T10:02:00Z
..."
            className="min-h-[200px] font-mono text-xs"
            onChange={onTextareaChange}
          />
          {errors?.gameData && (
            <p className="text-sm font-medium text-destructive mt-2">
              {errors.gameData[0]}
            </p>
          )}
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
