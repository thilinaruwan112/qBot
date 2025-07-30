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
    historicalData: z.string().optional().describe('A string of historical game data to use for a more comprehensive analysis.')
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
  analysis: z.string().describe('The analysis of betting patterns. It should start with a title, then sections for Multiplier Trend Analysis, and Statistical Insights.'),
  suggestedBetPositions: z
    .array(BetSuggestionSchema)
    .describe(
      'A list of suggested bet positions based on the analysis, including risk levels and potential yields. Only include suggestions with a probability of 80% or higher.'
    ),
  extractedData: z.string().describe('The raw data extracted from the image for display. Provide all available values, not just a limited set.'),
  predictedNextRounds: z.array(z.number()).optional().describe('An array of predicted multiplier values for the next 5 rounds.')
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
  prompt: `You are an expert in analyzing Aviator game data from an image to identify betting patterns. Your goal is to provide deep, insightful analysis, generate highly probable betting suggestions, and predict future rounds to help the user identify the correct position to bet. The user is specifically interested in multipliers of at least 5x.

  First, extract the complete round history from the image. Do not limit the number of values. Put the full extracted text in the 'extractedData' field.

  Then, before performing the analysis, clean the data by removing statistical outliers (extremely high or low values that are rare and can skew the results) to ensure predictions are based on more consistent patterns.

  Then, perform a deep analysis of the game data using the following methods:
  1.  **Study Multiplier Trends:** Analyze the multiplier trends from the historical data to gain insights into how often the plane crashes at various multiplier levels. While each flight is random, identify any patterns that may emerge over time.
  2.  **Utilize Statistical Analysis:** Apply statistical analysis to past results to identify trends or anomalies. Tools such as moving averages or regression analysis can help predict future outcomes.
  
  Based on your analysis, provide specific betting positions and risk levels for the user, but only suggest bets with a probability of 80% or higher.

  Structure your analysis in the 'analysis' field using the following format. Do not include markdown or emojis.

  Aviator Data Intelligence Report

  Multiplier Trend Analysis:
  [Based on your study of the multiplier trends, describe any patterns or insights you've found.]

  Statistical Insights:
  [Provide insights from your statistical analysis, such as moving averages or other trends.]

  Betting Suggestion:
  [Based on the combined analysis, give a clear, actionable suggestion with explicit reasoning. Explain how to use the analysis to identify the opportunity. For example: "The analysis indicates a high multiplier may occur soon. Therefore, there is a high probability of a significant multiplier on the next round. I suggest placing a bet for position X." This makes the logic clear.]

  After you have completed the detailed analysis and betting suggestion, predict the multiplier values for the next 5 rounds based on the patterns and trends you identified. Populate the 'predictedNextRounds' field with these values.

  {{#if historicalData}}
  Use this full historical data for a more comprehensive analysis:
  {{{historicalData}}}
  {{/if}}

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
