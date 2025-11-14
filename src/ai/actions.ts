'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define the Schema for the input data from the Python service
const AlgaeAnalysisInputSchema = z.object({
  total_count: z.number(),
  detailed_counts: z.array(
    z.object({
      algaeName: z.string(),
      count: z.number(),
    })
  ),
});

// Define the prompt that will be used to generate the insight
const algaeInsightPrompt = ai.definePrompt(
  {
    name: 'algaeInsightPrompt',
    input: { schema: AlgaeAnalysisInputSchema },
    output: { format: 'text' },
    prompt: `
      You are a senior environmental biologist.
      Analyze this algae data:
      - Total Count: {{{total_count}}}
      - Species: {{{jsonStringify detailed_counts}}}

      Provide a brief analysis and 1 recommended action based on the findings.
    `,
  },
  {
    helpers: {
      jsonStringify: (v: any) => JSON.stringify(v),
    }
  }
);

/**
 * Takes the analysis result from the Python model and returns an AI-generated insight.
 * @param analysis - The algae count data.
 * @returns A string containing the AI insight.
 */
export async function getAlgaeInsight(
  analysis: z.infer<typeof AlgaeAnalysisInputSchema>
): Promise<string> {
  const { text } = await algaeInsightPrompt(analysis);
  return text;
}
