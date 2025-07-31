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
  photoDataUris: z.array(z
    .string()
    .describe(
      "A screenshot of the 'Provably Fair' details for a game round, as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    )
  ),
});
export type AnalyzeHighOddsInput = z.infer<typeof AnalyzeHighOddsInputSchema>;

const AnalyzeHighOddsOutputSchema = z.object({
    analysisDetails: z.string().describe("The raw data extracted from the image, such as Round, Time, and Odd, presented in a structured markdown table. The table should have columns for Round, Time, and Odd Value."),
    signalTime: z.string().describe("The time zone for the signal, e.g., 'Signal Time (Sri Lanka Time)'. This must be based on the time extracted from the image."),
    timeRange: z.string().describe("The time range for the signal, in HH:MM:SS – HH:MM:SS format, e.g., '19:21:45 – 19:22:45'. This must be a plausible FUTURE time based on the analysis."),
    duration: z.string().describe("The duration of the signal, e.g., '1 minute'."),
    expectedTarget: z.string().describe("The expected multiplier target, e.g., '10x+'."),
    riskLevel: z.string().describe("The risk level and justification. The justification MUST be based on specific data from the analysisDetails table. For example: 'Low (Based on pattern after Round 3872070 with 69.97x)'."),
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
  prompt: `You are an expert in analyzing "Provably Fair" systems for games like Aviator. Your task is to analyze the provided screenshot(s) to generate a strategic signal for a high-odd event in the near future.

  1.  **Extract and Tabulate Data:** First, carefully extract all relevant data from the screenshot(s). This must include Round ID, Time, and Odd Value. Organize this information into a structured markdown table in the 'analysisDetails' field. The table should have the columns: "Round", "Time", and "Odd Value".

  2.  **Generate a Future Signal:** Based on your analysis of the data from the table you just created, generate a signal for the **next high odd**.
      - **Signal Time:** The time zone for this signal must be 'Signal Time (Sri Lanka Time)'.
      - **Time Range:** Based on your analysis of recent high odds in the table, create a plausible **future** 1-minute time window for the signal. For example, if your analysis suggests a high odd occurs every 3-5 minutes, and the last one in the image was at 01:07:04, a valid future signal could be '01:10:00 – 01:11:00'. The format must be exactly HH:MM:SS – HH:MM:SS. **DO NOT USE THE TIME FROM THE IMAGE, as it is in the past. Your signal must be for a future time relative to when the user is asking.**
      - **Duration:** This should always be '1 minute'.
      - **Expected Target:** Set the target multiplier. This should generally be '10x+'.
      - **Risk Level:** Assess the risk and provide a clear justification. The justification must be based on the patterns observed in the data table. For example: "Low (A high odd of 20.31x occurred at 01:04, followed by 10.25x at 01:07. A similar interval suggests another high odd is due)."

  Your output must be a signal object that is clear, concise, and provides an actionable, forward-looking alert based on the table analysis.

  Use the following image(s) for the analysis:
  {{#each photoDataUris}}
  Image: {{media url=this}}
  {{/each}}`,
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
