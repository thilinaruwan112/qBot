'use server';
/**
 * @fileOverview Analyzes historical Aviator game data to identify betting patterns and generate a statistical distribution of advantageous bet positions.
 *
 * - analyzeBettingPatterns - A function that analyzes betting patterns based on historical game data.
 * - AnalyzeBettingPatternsInput - The input type for the analyzeBettingPatterns function.
 * - AnalyzeBettingPatternsOutput - The return type for the analyzeBettingPatterns function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeBettingPatternsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the game data, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeBettingPatternsInput = z.infer<typeof AnalyzeBettingPatternsInputSchema>;

const BetSuggestionSchema = z.object({
  position: z.number().describe('The multiplier to bet on.'),
  yield: z.number().describe('The potential yield for this bet.'),
  probability: z
    .number()
    .describe(
      'The probability of this outcome in percent. This should be between 80 and 99.'
    ),
  risk: z.enum(['Low', 'Medium', 'High']).describe('The risk level associated with the bet.'),
});

const AnalyzeBettingPatternsOutputSchema = z.object({
  analysis: z.string().describe('The analysis of betting patterns.'),
  suggestedBetPositions: z
    .array(BetSuggestionSchema)
    .describe(
      'A list of suggested bet positions based on the analysis, including risk levels and potential yields. Only include suggestions with a probability of 80% or higher.'
    ),
  extractedData: z.string().describe('The raw data extracted from the image for display.')
});
export type AnalyzeBettingPatternsOutput = z.infer<typeof AnalyzeBettingPatternsOutputSchema>;

export async function analyzeBettingPatterns(
  input: AnalyzeBettingPatternsInput
): Promise<AnalyzeBettingPatternsOutput> {
  return analyzeBettingPatternsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeBettingPatternsPrompt',
  input: {schema: AnalyzeBettingPatternsInputSchema},
  output: {schema: AnalyzeBettingPatternsOutputSchema},
  prompt: `You are an expert in analyzing Aviator game data from an image to identify betting patterns. Your goal is to provide deep, insightful analysis and generate highly probable betting suggestions.

  First, extract the complete round history from the image and put it in the extractedData field.

  Then, perform a deep analysis of the provided image of game data. Identify complex patterns, calculate statistical distributions, and determine advantageous bet positions. Provide specific betting positions and risk levels for the user, but only suggest bets with a probability of 80% or higher.

  Structure your analysis in the 'analysis' field using the following format, including the emojis and markdown:

  ### 🔎 Latest Aviator Round History Analysis
  **🟣 High Multipliers (Recent):**
  List the recent high multipliers (e.g., >10x) you've identified.

  **🔥 Pattern Detection (Recent High Gaps):**
  Show recent streaks of low/medium multipliers that were followed by a high multiplier. For example:
  Low/Medium Streak → High Multiplier After
  1.62x → 2.62x → 2.73x → 11.04x
  ...
  NOW: [current streak] → ???

  **⚠️ Current Situation:**
  - Briefly describe the most recent rounds.
  - Note how many rounds it has been since the last true high multiplier.
  - Provide any other critical observations from your deep analysis.

  **✅ Betting Suggestion:**
  - Based on the patterns, give a clear, actionable suggestion.
  - For example: "If next round is low (under 2x), prepare to bet in the 2nd or 3rd round for a 10x+ cashout."
  - Explain the reasoning based on past patterns (e.g., "Past pattern shows high multipliers come every ~6-8 low/medium rounds.")

  Image: {{media url=photoDataUri}}`,
});

const analyzeBettingPatternsFlow = ai.defineFlow(
  {
    name: 'analyzeBettingPatternsFlow',
    inputSchema: AnalyzeBettingPatternsInputSchema,
    outputSchema: AnalyzeBettingPatternsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
