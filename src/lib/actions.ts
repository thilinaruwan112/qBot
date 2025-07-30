'use server';

import {
  analyzeBettingPatterns,
  type AnalyzeBettingPatternsOutput,
} from '@/ai/flows/analyze-betting-patterns';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

const formSchema = z.object({
  photoDataUri: z.string().min(1, {
    message: 'Please upload an image.',
  }),
});

export type AnalysisState = {
  message: string;
  errors: Record<string, string[]> | null;
  analysisResult: AnalyzeBettingPatternsOutput | null;
  historicalData?: string[];
};

// Simple in-memory cache for game data to avoid reading the file on every request
let gameDataCache: string[] | null = null;
const dataFilePath = path.join(process.cwd(), 'src', 'lib', 'game-data.json');

async function getHistoricalData(): Promise<string[]> {
  if (gameDataCache) return gameDataCache;
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
    const data = JSON.parse(fileContent);
    gameDataCache = Array.isArray(data) ? data : [];
    return gameDataCache!;
  } catch (error) {
    // If the file doesn't exist or is invalid, start with an empty array
    return [];
  }
}

async function updateHistoricalData(newData: string): Promise<string[]> {
    const historicalData = await getHistoricalData();
    const newValues = newData.match(/[\d.]+(?=x)/g) || [];
    
    const historicalSet = new Set(historicalData);
    const originalSize = historicalSet.size;

    newValues.forEach(value => {
        historicalSet.add(value);
    });

    if (historicalSet.size > originalSize) {
        const newHistory = Array.from(historicalSet);
        try {
            await fs.writeFile(dataFilePath, JSON.stringify(newHistory, null, 2), 'utf-8');
            gameDataCache = newHistory; // Update cache
        } catch (error) {
            console.error('Failed to write historical data:', error);
            // Return original data if write fails
            return historicalData;
        }
        return newHistory;
    }

    return historicalData;
}


export async function getBettingAnalysis(
  prevState: AnalysisState,
  formData: FormData
): Promise<AnalysisState> {
  const validatedFields = formSchema.safeParse({
    photoDataUri: formData.get('photoDataUri'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data. Please upload an image.',
      errors: validatedFields.error.flatten().fieldErrors,
      analysisResult: null,
    };
  }

  try {
    // First, get the analysis result which includes the newly extracted data
    const preliminaryResult = await analyzeBettingPatterns({
      photoDataUri: validatedFields.data.photoDataUri,
    });
    
    // Update historical data with the new values. This now handles de-duplication.
    const fullHistory = await updateHistoricalData(preliminaryResult.extractedData);

    // Now, run the analysis again with the full historical context
    const finalResult = await analyzeBettingPatterns({
        photoDataUri: validatedFields.data.photoDataUri,
        historicalData: `Round History: ${fullHistory.join('x, ')}x`
    });

    return {
      message: 'Success',
      errors: null,
      analysisResult: finalResult,
      historicalData: fullHistory,
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

export async function clearHistoricalData(): Promise<{ success: boolean; message: string; }> {
    try {
        await fs.writeFile(dataFilePath, '[]', 'utf-8');
        gameDataCache = [];
        return { success: true, message: 'Historical data cleared successfully.' };
    } catch (error) {
        console.error('Failed to clear historical data:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message: `Failed to clear data: ${errorMessage}` };
    }
}
