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
  analysis: z.string().describe('The analysis of betting patterns. It should start with a title, then sections for Profitability Analysis, High Multipliers, Pattern Detection, Current Situation, and Betting Suggestion.'),
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
  prompt: `You are an expert in analyzing Aviator game data from an image to identify betting patterns. Your goal is to provide deep, insightful analysis and generate highly probable betting suggestions to help the user identify the correct position to bet.

  First, extract the complete round history from the image and put it in the extractedData field.

  Then, before performing the main analysis, clean the data by removing any extreme statistical outliers that could skew the results. These are typically unusually high multipliers that are rare anomalies.

  Perform a deep analysis of the cleaned game data using the following methods:
  1.  **Profitability Analysis (ECDF):** Analyze the data to find profitable betting positions 'x'. A position 'x' is profitable if the historical probability of the game ending before 'x' is less than (1 - 1/x). Calculate the empirical cumulative distribution function (ECDF) from the data and identify a few values of 'x' that satisfy this condition.
  2.  **Moving Average Analysis:** Smooth out short-term fluctuations to identify streaks of low or high multipliers. Calculate the average multiplier of the last 5 rounds. If it’s low (<2x), state that you expect a high one soon.
  3.  **Frequency Distribution:** Track how often certain multiplier ranges occur. State the probability of getting ≤2x, 2–10x, and ≥10x based on the data.
  4.  **Gap Analysis:** Measure the number of low rounds before each high round. Use this to predict when the next high multiplier might appear.
  5.  **Pattern Detection:** Identify recurring sequences of multipliers that lead to a high-value outcome. For example, "1.2x -> 1.5x -> 1.1x -> 10x" is a pattern.

  Provide specific betting positions and risk levels for the user, but only suggest bets with a probability of 80% or higher.

  Structure your analysis in the 'analysis' field using the following format. Do not include markdown or emojis.

  Aviator Data Intelligence Report

  Profitability Analysis (ECDF Method):
  [Based on the ECDF analysis, list a few 'x' values that have been historically profitable and explain why in simple terms.]

  Moving Average Analysis (Last 5 Rounds):
  [Your analysis of the moving average and what it indicates]

  Frequency Distribution:
  [Your analysis of multiplier frequencies (≤2x, 2-10x, ≥10x) and what it implies]

  Gap Analysis:
  [Your analysis of the gaps between high multipliers and what it predicts]

  Pattern Detection:
  [Your analysis of recurring patterns and what they might predict for the next rounds]

  Betting Suggestion:
  [Based on the combined analysis, give a clear, actionable suggestion with explicit reasoning. Explain how to use the analysis to identify the opportunity. For example: "The Gap Analysis indicates a high multiplier occurs after about 5 low rounds. We are currently on the 4th low round. Therefore, there is a high probability of a significant multiplier on the next round. I suggest placing a bet for position X." This makes the logic clear.]

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
