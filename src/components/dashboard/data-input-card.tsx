"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, Loader2, Image as ImageIcon, X, ClipboardPaste } from "lucide-react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { useToast } from '@/hooks/use-toast';

type DataInputCardProps = {
  formRef: React.RefObject<HTMLFormElement>;
  formAction: (payload: FormData) => void;
  errors: Record<string, string[]> | null | undefined;
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
}: DataInputCardProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dataUri, setDataUri] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleFileChange = (file: File | null) => {
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
            title: "Invalid File Type",
            description: "Please upload an image file (PNG, JPG, GIF).",
            variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
        setDataUri(result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
      setDataUri('');
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    handleFileChange(file || null);
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    setDataUri('');
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  const handlePaste = async () => {
    try {
        const clipboardItems = await navigator.clipboard.read();
        for (const item of clipboardItems) {
            const imageType = item.types.find(type => type.startsWith('image/'));
            if (imageType) {
                const blob = await item.getType(imageType);
                handleFileChange(new File([blob], "pasted-image.png", { type: imageType }));
                return;
            }
        }
        toast({
            title: "No Image Found",
            description: "No image was found on your clipboard.",
            variant: "destructive",
        });
    } catch(err) {
        console.error("Paste failed", err);
        toast({
            title: "Paste Failed",
            description: "Could not read image from clipboard. Your browser might not support this feature or require permissions.",
            variant: "destructive",
        });
    }
  };

  return (
    <Card>
      <form ref={formRef} action={formAction}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UploadCloud className="h-6 w-6 text-primary" />
            <CardTitle>Upload Game Data</CardTitle>
          </div>
          <CardDescription>
            Upload an image of your historical game data. You can also paste it from clipboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input type="hidden" name="photoDataUri" value={dataUri} />
          {previewUrl ? (
            <div className="relative">
              <Image
                src={previewUrl}
                alt="Uploaded preview"
                width={500}
                height={300}
                className="rounded-md object-contain"
              />
              <Button 
                variant="destructive" 
                size="icon" 
                className="absolute top-2 right-2 h-6 w-6"
                onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              ref={dropzoneRef}
              className="flex items-center justify-center w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImageIcon className="w-8 h-8 mb-4 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag
                    and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG or GIF
                  </p>
                </div>
                <Input
                  id="file-upload"
                  ref={fileInputRef}
                  name="file-upload"
                  type="file"
                  className="hidden"
                  accept="image/png, image/jpeg, image/gif"
                  onChange={handleFileInputChange}
                />
              </label>
            </div>
          )}

          {errors?.photoDataUri && (
            <p className="text-sm font-medium text-destructive mt-2">
              {errors.photoDataUri[0]}
            </p>
          )}
        </CardContent>
        <CardFooter className="justify-between">
            <SubmitButton />
            <Button type="button" variant="outline" onClick={handlePaste}>
                <ClipboardPaste className="mr-2 h-4 w-4" />
                Paste Image
            </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
