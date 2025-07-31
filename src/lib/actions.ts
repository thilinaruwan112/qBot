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
    // The flow currently supports only one image, so we pass the first one.
    // However, the schema validation ensures at least one is present.
    // If the flow were updated to handle multiple images, the array is ready.
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
      // The flow currently supports only one image, so we pass the first one.
      // If the flow were updated to handle multiple images, the array is ready.
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
