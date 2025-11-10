'use server';

/**
 * @fileOverview Summarizes the history of a water sample's algae content over time.
 *
 * - summarizeSampleHistory - A function that summarizes the water sample history.
 * - SummarizeSampleHistoryInput - The input type for the summarizeSampleHistory function.
 * - SummarizeSampleHistoryOutput - The return type for the summarizeSampleHistory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeSampleHistoryInputSchema = z.object({
  sampleHistory: z.array(
    z.object({
      date: z.string().describe('Date of the test'),
      algaeContent: z.record(z.number()).describe('Classification of algae and their counts'),
      testNumber: z.number().describe('Test number for the sample'),
    })
  ).describe('History of algae content for a specific water sample.'),
});
export type SummarizeSampleHistoryInput = z.infer<typeof SummarizeSampleHistoryInputSchema>;

const SummarizeSampleHistoryOutputSchema = z.object({
  summary: z.string().describe('A summary of the algae content trend over time.'),
});
export type SummarizeSampleHistoryOutput = z.infer<typeof SummarizeSampleHistoryOutputSchema>;

export async function summarizeSampleHistory(input: SummarizeSampleHistoryInput): Promise<SummarizeSampleHistoryOutput> {
  return summarizeSampleHistoryFlow(input);
}

const summarizeSampleHistoryPrompt = ai.definePrompt({
  name: 'summarizeSampleHistoryPrompt',
  input: {schema: SummarizeSampleHistoryInputSchema},
  output: {schema: SummarizeSampleHistoryOutputSchema},
  prompt: `You are an expert in analyzing water sample data and identifying trends in algae growth.

  Given the following historical data for a water sample, provide a concise summary of the algae content trend over time.  Indicate whether the algae content is generally increasing, decreasing, or fluctuating, and highlight any significant changes or patterns.

  Sample History:
  {{#each sampleHistory}}
  Test Number: {{this.testNumber}}
  Date: {{this.date}}
  Algae Content: {{#each this.algaeContent}}{{@key}}: {{this}} {{/each}}
  {{/each}}
  `,
});

const summarizeSampleHistoryFlow = ai.defineFlow(
  {
    name: 'summarizeSampleHistoryFlow',
    inputSchema: SummarizeSampleHistoryInputSchema,
    outputSchema: SummarizeSampleHistoryOutputSchema,
  },
  async input => {
    const {output} = await summarizeSampleHistoryPrompt(input);
    return output!;
  }
);
