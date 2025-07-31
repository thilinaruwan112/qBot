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
    analysisDetails: z.string().describe("The raw data extracted from the image, such as Round, Time, Odd, Seeds, and Hash. This should be a structured block of text."),
    signalTime: z.string().describe("The time zone for the signal, e.g., 'Signal Time (Sri Lanka Time)'. This must be based on the time extracted from the image."),
    timeRange: z.string().describe("The time range for the signal, e.g., '19:21:45 – 19:22:45'. This must be based on the time extracted from the image."),
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

  1.  **Extract Data:** First, carefully extract all relevant data from the screenshot. This must include Round ID, Time, Odd Value, and any available seed/hash information. Populate this raw data in the 'analysisDetails' field.

  2.  **Generate a Signal:** Based *strictly* on the data you just extracted, generate a signal.
      - **Signal Time:** Determine the appropriate time zone from the image. If not specified, use a generic placeholder like "Signal Time (Local)".
      - **Time Range:** Create a plausible 1-minute time window for the signal based *only* on the time you extracted from the image. For example, if the extracted time is 00:50:30, the range could be '00:50:45 – 00:51:45'. **DO NOT INVENT A TIME.**
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
