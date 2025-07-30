'use server';

import { analyzeBettingPatterns, type AnalyzeBettingPatternsOutput } from '@/ai/flows/analyze-betting-patterns';
import { z } from 'zod';

const formSchema = z.object({
  gameData: z.string().min(10, {
    message: 'Game data must be at least 10 characters.',
  }),
});

export type AnalysisState = {
  message: string;
  errors: Record<string, string[]> | null;
  analysisResult: AnalyzeBettingPatternsOutput | null;
};


export async function getBettingAnalysis(prevState: AnalysisState, formData: FormData): Promise<AnalysisState> {
  const validatedFields = formSchema.safeParse({
    gameData: formData.get('gameData'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data. Please provide more data.',
      errors: validatedFields.error.flatten().fieldErrors,
      analysisResult: null,
    };
  }

  try {
    const result = await analyzeBettingPatterns({
      gameData: validatedFields.data.gameData,
    });
    return {
      message: 'Success',
      errors: null,
      analysisResult: result,
    };
  } catch (error) {
    return {
      message: 'An error occurred during analysis. Please try again.',
      errors: null,
      analysisResult: null,
    };
  }
}
