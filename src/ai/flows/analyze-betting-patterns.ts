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
  analysis: z.string().describe('The analysis of betting patterns. It should start with a title, then a section for Color Pattern Analysis.'),
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
  prompt: `You are an expert in analyzing Aviator game data to identify betting patterns using the "Blue, Purple, Pink" method. Your goal is to analyze multiplier colors, provide a clear betting suggestion, and predict the next five rounds.

  The color categories are:
  - **Blue:** Multipliers less than 2x.
  - **Purple:** Multipliers from 2x up to 10x.
  - **Pink:** Multipliers 10x and higher.
  
  First, extract the complete round history from the image. Do not limit the number of values. Put the full extracted text in the 'extractedData' field.

  Next, perform the analysis using the following steps:
  1.  **Analyze Color Patterns:** Analyze the sequence of Blue, Purple, and Pink rounds from the historical data. Identify any patterns, such as the number of Blue rounds that typically appear before a Purple or Pink round.
  2.  **Formulate a Betting Suggestion:** Based on your analysis, provide a clear and actionable betting suggestion. Explain the reasoning based on the color patterns you've observed. For example: "After a series of 5 consecutive Blue rounds, a Purple or Pink is statistically overdue. I suggest betting on the next round."
  
  Structure your analysis in the 'analysis' field using the following format. Do not include markdown or emojis.

  Aviator Data Intelligence Report

  Color Pattern Analysis:
  [Describe the patterns you have found in the sequence of Blue, Purple, and Pink rounds. For example: "The data shows a recurring pattern of 4-6 Blue rounds followed by a Purple or Pink round." Be specific.]

  Betting Suggestion:
  [Based on the pattern analysis, give a clear, actionable suggestion with explicit reasoning. For example: "The analysis indicates a high multiplier may occur soon after a streak of low multipliers. There is a high probability of a significant multiplier on the next round. I suggest placing a bet for a position above 2x." This makes the logic clear.]

  After you have completed the detailed analysis and betting suggestion, predict the multiplier values for the next 5 rounds based on the color patterns and trends you identified. Populate the 'predictedNextRounds' field with these values.

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
