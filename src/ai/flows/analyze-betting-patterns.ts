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
  yield: z.number().describe('The potential multiplier for this bet if it wins.'),
  probability: z
    .number()
    .describe(
      'The probability of this outcome in percent. This should be between 80 and 99.'
    ),
  risk: z.enum(['Low', 'Medium', 'High']).describe('The risk level associated with the bet.'),
});

const AnalyzeBettingPatternsOutputSchema = z.object({
  analysis: z.string().describe('The analysis of betting patterns. It should start with a title, then a section for Trend Analysis, and finally a Betting Suggestion section.'),
  suggestedBetPositions: z
    .array(BetSuggestionSchema)
    .describe(
      'A list of suggested bet positions based on the analysis, including risk levels and potential yields. Only include suggestions with a probability of 80% or higher and a multiplier of at least 1.5x.'
    ),
  extractedData: z.string().describe('The raw data extracted from the image for display. Provide all available values, not just a limited set.'),
  predictions: z.array(z.number()).describe('A list of 10 predicted multiplier values for the next 10 rounds.'),
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
  prompt: `You are an expert in analyzing Aviator game data to suggest betting strategies. Your goal is to analyze multiplier trends and provide clear, actionable suggestions based on statistical analysis and a balanced two-bet strategy.

  First, extract the complete round history from the image. Do not limit the number of values. Put the full extracted text in the 'extractedData' field.

  Next, perform the analysis using the following steps:
  1.  **Study Multiplier Trends:** Analyze the sequence of multipliers from the historical data. Note any emerging patterns, such as streaks of low multipliers (e.g., below 2.0x).
  2.  **Formulate a Betting Suggestion:** Based on your trend analysis, provide a clear and actionable betting suggestion using the dual-bet strategy:
      - **Safe Bet:** A low-risk bet aiming for a small, quick win (e.g., 1.5x-2.0x). This should be the default recommendation to secure returns.
      - **High-Yield Bet:** A riskier bet aiming for a higher multiplier (e.g., 10x+), but only when your analysis suggests a high multiplier might be due (e.g., after a long streak of low multipliers).
  
  Structure your analysis in the 'analysis' field using the following format. Do not include markdown or emojis.

  Aviator Data Intelligence Report

  Trend Analysis:
  [Describe the patterns you have found in the sequence of multipliers. For example: "The data shows a recurring pattern of 5-7 low multipliers (under 2x) followed by a significantly higher one." Be specific about your observation from the provided data.]

  Betting Suggestion:
  [Based on the trend analysis, provide a clear, actionable suggestion using the two-bet strategy. For example: "The last high multiplier was 8 rounds ago, and there has been a streak of 6 low multipliers. I suggest placing a safe bet aiming for 1.5x-2.0x for a guaranteed return. Concurrently, place a smaller, high-risk bet aiming for a position above 10x to capitalize on the potential for a high multiplier." This makes the logic clear.]

  Then, populate the 'suggestedBetPositions' field. This should include both a safe bet (low risk, low yield) and, if the analysis warrants it, a high-risk bet. Focus on suggestions with a high probability (80% or more for safe bets).

  Finally, based *strictly* on your trend analysis and the provided betting strategy, predict the multiplier values for the next 10 rounds and add them to the 'predictions' field.
  - Your predictions should reflect the dual-bet strategy. Include several low, "safe" multiplier predictions (e.g., 1.35x, 1.8x).
  - If your analysis suggests a high multiplier is due, one of your predictions should be a high value (e.g., 11.5x).
  - **DO NOT INVENT RANDOM HIGH VALUES.** Your predictions must be a logical extension of your analysis. If the conditions for a high multiplier are not met, do not predict one.

  Use this image for the most recent data:
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
