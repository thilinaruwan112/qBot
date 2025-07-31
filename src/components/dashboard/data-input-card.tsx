"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  isPending?: boolean;
};

function SubmitButton({ isPending }: { isPending?: boolean }) {
    const status = useFormStatus();
    const pending = isPending ?? status.pending;
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
  isPending,
}: DataInputCardProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [dataUris, setDataUris] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleFiles = useCallback((files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
        toast({
            title: "No Valid Files",
            description: "Please upload image files (PNG, JPG, GIF).",
            variant: "destructive",
        });
        return;
    }

    imageFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setPreviewUrls(prev => [...prev, result]);
            setDataUris(prev => [...prev, result]);
        };
        reader.readAsDataURL(file);
    });
  }, [toast]);

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
        handleFiles(event.target.files);
    }
  }

  const handleRemoveImage = (index: number) => {
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    setDataUris(prev => prev.filter((_, i) => i !== index));
    
    // We need to update the files in the input element
    if (fileInputRef.current && fileInputRef.current.files) {
        const dataTransfer = new DataTransfer();
        const files = Array.from(fileInputRef.current.files);
        files.splice(index, 1);
        files.forEach(file => dataTransfer.items.add(file));
        fileInputRef.current.files = dataTransfer.files;
    }
  }
  
  const clearImages = () => {
    setPreviewUrls([]);
    setDataUris([]);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  const handlePaste = useCallback(async () => {
    try {
        const clipboardItems = await navigator.clipboard.read();
        const imageBlobs: File[] = [];
        for (const item of clipboardItems) {
            const imageType = item.types.find(type => type.startsWith('image/'));
            if (imageType) {
                const blob = await item.getType(imageType);
                imageBlobs.push(new File([blob], "pasted-image.png", { type: imageType }));
            }
        }
        if (imageBlobs.length > 0) {
            handleFiles(imageBlobs);
        } else {
             toast({
                title: "No Image Found",
                description: "No image was found on your clipboard.",
                variant: "destructive",
            });
        }
    } catch(err) {
        console.error("Paste failed", err);
        toast({
            title: "Paste Failed",
            description: "Could not read image from clipboard. Your browser might not support this feature or require permissions.",
            variant: "destructive",
        });
    }
  }, [handleFiles, toast]);

  useEffect(() => {
    const dropzone = dropzoneRef.current;
    if (dropzone) {
        const handleDragOver = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add('border-primary', 'bg-accent');
        };
        const handleDragLeave = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('border-primary', 'bg-accent');
        }
        const handleDrop = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('border-primary', 'bg-accent');
            if (e.dataTransfer?.files) {
                handleFiles(e.dataTransfer.files);
            }
        };
        dropzone.addEventListener('dragover', handleDragOver);
        dropzone.addEventListener('dragleave', handleDragLeave);
        dropzone.addEventListener('drop', handleDrop);
        return () => {
            dropzone.removeEventListener('dragover', handleDragOver);
            dropzone.removeEventListener('dragleave', handleDragLeave);
            dropzone.removeEventListener('drop', handleDrop);
        }
    }
  }, [handleFiles]);


  return (
    <Card>
      <form ref={formRef} action={formAction}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UploadCloud className="h-6 w-6 text-primary" />
            <CardTitle>Upload Game Data</CardTitle>
          </div>
          <CardDescription>
            Upload one or more images of your historical game data. You can also paste them from your clipboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dataUris.map((uri, index) => (
             <input type="hidden" name="photoDataUri" value={uri} key={index} />
          ))}
         
          {previewUrls.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative aspect-video">
                    <Image
                        src={url}
                        alt={`Uploaded preview ${index + 1}`}
                        fill
                        className="rounded-md object-contain"
                    />
                    <Button 
                        variant="destructive" 
                        size="icon" 
                        className="absolute top-1 right-1 h-6 w-6 z-10"
                        onClick={() => handleRemoveImage(index)}
                        type="button"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
              ))}
            </div>
          ) : (
            <div
              ref={dropzoneRef}
              className="flex items-center justify-center w-full"
            >
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImageIcon className="w-8 h-8 mb-4 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag
                    and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG or GIF (multiple allowed)
                  </p>
                </div>
                <Input
                  id="file-upload"
                  ref={fileInputRef}
                  name="file-upload"
                  type="file"
                  multiple
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
            <div className="flex gap-2">
                <SubmitButton isPending={isPending} />
                {previewUrls.length > 0 && <Button type="button" variant="ghost" onClick={clearImages}>Clear</Button>}
            </div>
            <Button type="button" variant="outline" onClick={handlePaste}>
                <ClipboardPaste className="mr-2 h-4 w-4" />
                Paste Image
            </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
