'use server';
/**
 * @fileOverview Analyzes Aviator game round data from a "Provably Fair" screenshot to generate a high-odd signal.
 *
 * - analyzeHighOdds - A function that analyzes game seeds and hashes to generate a signal.
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
    signalTime: z.string().describe("The time zone for the signal, e.g., 'Signal Time (Sri Lanka Time)'."),
    timeRange: z.string().describe("The time range for the signal, e.g., '19:21:45 – 19:22:45'."),
    duration: z.string().describe("The duration of the signal, e.g., '1 minute'."),
    expectedTarget: z.string().describe("The expected multiplier target, e.g., '10x+'."),
    riskLevel: z.string().describe("The risk level and justification, e.g., 'Low (Based on pattern after Round 3872070 with 69.97x)'."),
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
  prompt: `You are an expert in analyzing "Provably Fair" systems for games like Aviator. Your task is to analyze the provided screenshot to generate a strategic signal for a high-odd event.

  1.  **Analyze Data:** Carefully analyze the data in the screenshot. This could be round history, 'Provably Fair' details (seeds, hashes), or other game data. Identify patterns or indicators that suggest a high-value multiplier might be imminent. Pay close attention to sequences of multipliers, time between high odds, and any data from the fair-play system.

  2.  **Generate a Signal:** Based on your analysis, generate a signal with the following components.
      - **Signal Time:** Determine the appropriate time zone. If not specified, use a generic placeholder like "Signal Time (Local)".
      - **Time Range:** Based on the current time (assume the image is recent) or patterns, create a plausible 1-minute time window for the signal. For example, if the current time is 19:21, the range could be '19:21:45 – 19:22:45'.
      - **Duration:** This should always be '1 minute'.
      - **Expected Target:** Set the target multiplier. This should generally be '10x+'.
      - **Risk Level:** Assess the risk and provide a clear justification. The justification must be based on data from the image. For example: "Low (Based on pattern after Round 3872070 with 69.97x)" or "Medium (A high odd appeared recently, but a pattern is emerging)".

  Your output must be a signal object that is clear, concise, and directly based on the data provided in the image.

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
