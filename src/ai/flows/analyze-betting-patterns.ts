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
  analysis: z.string().describe('The analysis of betting patterns. It should start with a title, then a section for Color Pattern Analysis, and finally a Betting Suggestion section.'),
  suggestedBetPositions: z
    .array(BetSuggestionSchema)
    .describe(
      'A list of suggested bet positions based on the analysis, including risk levels and potential yields. Only include suggestions with a probability of 80% or higher and a multiplier of at least 5x.'
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
  prompt: `You are an expert in analyzing Aviator game data to identify betting patterns using the "Blue, Purple, Pink" method. Your goal is to analyze multiplier colors and provide a clear betting suggestion.

  The color categories are:
  - **Blue:** Multipliers less than or equal to 2x.
  - **Purple:** Multipliers from 2x up to 10x.
  - **Pink:** Multipliers greater than 10x.
  
  First, extract the complete round history from the image. Do not limit the number of values. Put the full extracted text in the 'extractedData' field.

  Next, perform the analysis using the following steps:
  1.  **Analyze Color Patterns:** Analyze the sequence of Blue, Purple, and Pink rounds from the historical data. Observe how many Blue/Purple rounds tend to appear between Pink rounds.
  2.  **Formulate a Betting Suggestion:** Based on your analysis, provide a clear and actionable betting suggestion. Your strategy should be: "Watch for gaps of 5-8 rounds after a pink multiplier. After seeing 4-6 blue/purple multipliers in a row, place a modest bet aiming for 10x or higher."
  
  Structure your analysis in the 'analysis' field using the following format. Do not include markdown or emojis.

  Aviator Data Intelligence Report

  Color Pattern Analysis:
  [Describe the patterns you have found in the sequence of Blue, Purple, and Pink rounds. For example: "The data shows a recurring pattern of 5-8 blue/purple rounds followed by a Pink round." Be specific about your observation from the provided data.]

  Betting Suggestion:
  [Based on the pattern analysis and the current sequence, give a clear, actionable suggestion with explicit reasoning. For example: "The last Pink multiplier was 7 rounds ago, and there has been a streak of 6 blue/purple rounds. According to the strategy, a high multiplier may be due. I suggest placing a bet for a position above 10x on an upcoming round." This makes the logic clear.]

  Then, populate the 'suggestedBetPositions' field. Focus on suggestions with a multiplier of at least 5x and a high probability (80% or more) based on your analysis.

  Finally, based on your analysis, predict the multiplier values for the next 10 rounds and add them to the 'predictions' field.

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
