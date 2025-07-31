'use server';
/**
 * @fileOverview Analyzes Aviator game round data from a "Provably Fair" screenshot to identify signals for high odds.
 *
 * - analyzeHighOdds - A function that analyzes game seeds and hashes.
 * - AnalyzeHighOddsInput - The input type for the analyzeHighOdds function.
 * - AnalyzeHighOddsOutput - The return type for the analyzeHighOdds function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeHighOddsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A screenshot of the 'Provably Fair' details for a game round, as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeHighOddsInput = z.infer<typeof AnalyzeHighOddsInputSchema>;

const AnalyzeHighOddsOutputSchema = z.object({
  extractedData: z.object({
    roundId: z.string().describe('The extracted round ID.'),
    serverSeed: z.string().describe('The extracted server seed.'),
    clientSeed: z.string().describe('The extracted client seed.'),
    combinedHash: z.string().describe('The combined SHA512 hash.'),
    resultOdd: z.number().describe('The resulting odd for the round.'),
  }),
  analysisSignal: z.string().describe('A detailed analysis and signal based on the extracted data. It should explain if any patterns in the seeds or hash correlate with high-value odds and provide a strategic insight.'),
});
export type AnalyzeHighOddsOutput = z.infer<typeof AnalyzeHighOddsOutputSchema>;

export async function analyzeHighOdds(
  input: AnalyzeHighOddsInput
): Promise<AnalyzeHighOddsOutput> {
  return analyzeHighOddsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeHighOddsPrompt',
  input: {schema: AnalyzeHighOddsInputSchema},
  output: {schema: AnalyzeHighOddsOutputSchema},
  prompt: `You are an expert in analyzing "Provably Fair" systems for games like Aviator. Your task is to extract all relevant data from the provided screenshot and generate a strategic signal based on it.

  1.  **Extract Data:** Carefully extract the following from the image and populate the 'extractedData' field:
      - Round ID
      - Server Seed
      - Client Seed (use Player N1's seed if multiple are present)
      - Combined SHA512 Hash
      - Result Odd (the final multiplier for the round)

  2.  **Generate Analysis Signal:** Based on the extracted data, provide a detailed analysis in the 'analysisSignal' field. Your analysis should:
      - Briefly explain the relationship between the seeds, the hash, and the result.
      - Analyze if any characteristics of the seeds or the hash (e.g., specific characters, patterns, length) seem to correlate with the resulting odd being high (>10x) or low.
      - Conclude with a strategic "signal" or insight. For example: "The analysis of round {roundId} shows that a server seed starting with '8F' and a client seed containing 'Wy2' resulted in a high odd of {resultOdd}x. While not a guarantee, players could watch for similar seed patterns as a potential indicator for higher-risk, high-reward bets."
      - **Do not make definitive predictions.** Frame the output as an analytical insight into potential correlations.

  Use the following image for the analysis:
  Image: {{media url=photoDataUri}}`,
});

const analyzeHighOddsFlow = ai.defineFlow(
  {
    name: 'analyzeHighOddsFlow',
    inputSchema: AnalyzeHighOddsInputSchema,
    outputSchema: AnalyzeHighOddsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
