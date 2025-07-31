'use server';

import {
  analyzeBettingPatterns,
  type AnalyzeBettingPatternsOutput,
} from '@/ai/flows/analyze-betting-patterns';
import {
    analyzeHighOdds,
    type AnalyzeHighOddsOutput,
} from '@/ai/flows/analyze-high-odds';
import { z } from 'zod';

const formSchema = z.object({
  photoDataUri: z.array(z.string().min(1)).min(1, {
    message: 'Please upload at least one image.',
  }),
});

export type AnalysisState = {
  message: string;
  errors: Record<string, string[]> | null;
  analysisResult: AnalyzeBettingPatternsOutput | null;
};

export async function getBettingAnalysis(
  prevState: AnalysisState,
  formData: FormData
): Promise<AnalysisState> {
    const validatedFields = formSchema.safeParse({
        photoDataUri: formData.getAll('photoDataUri'),
    });

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data. Please upload an image.',
      errors: validatedFields.error.flatten().fieldErrors,
      analysisResult: null,
    };
  }

  try {
    // For now, we'll just use the first image. The flow only supports one.
    // In the future, we could update the flow to accept multiple images.
    const result = await analyzeBettingPatterns({
      photoDataUri: validatedFields.data.photoDataUri[0],
    });

    return {
      message: 'Success',
      errors: null,
      analysisResult: result,
    };
  } catch (error) {
    console.error("Error during analysis:", error);
    return {
      message: 'An error occurred during analysis. Please try again.',
      errors: null,
      analysisResult: null,
    };
  }
}

// State for High Odd Analysis
export type HighOddAnalysisState = {
    message: string;
    errors: Record<string, string[]> | null;
    analysisResult: AnalyzeHighOddsOutput | null;
};

export async function getHighOddAnalysis(
    prevState: HighOddAnalysisState,
    formData: FormData
  ): Promise<HighOddAnalysisState> {
    const validatedFields = formSchema.safeParse({
        photoDataUri: formData.getAll('photoDataUri'),
    });
  
    if (!validatedFields.success) {
      return {
        message: 'Invalid form data. Please upload an image.',
        errors: validatedFields.error.flatten().fieldErrors,
        analysisResult: null,
      };
    }
  
    try {
      // For now, we'll just use the first image. The flow only supports one.
      const result = await analyzeHighOdds({
        photoDataUri: validatedFields.data.photoDataUri[0],
      });
  
      return {
        message: 'Success',
        errors: null,
        analysisResult: result,
      };
    } catch (error) {
      console.error("Error during high odd analysis:", error);
      return {
        message: 'An error occurred during analysis. Please try again.',
        errors: null,
        analysisResult: null,
      };
    }
  }
