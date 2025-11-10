'use server';

/**
 * @fileOverview Explains the implications of detected algae content using the Gemini API.
 *
 * - explainAlgaeImplications - A function that takes algae content as input and returns an explanation of its implications.
 * - ExplainAlgaeImplicationsInput - The input type for the explainAlgaeImplications function.
 * - ExplainAlgaeImplicationsOutput - The return type for the explainAlgaeImplications function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainAlgaeImplicationsInputSchema = z.object({
  algaeContent: z.string().describe('The detected algae content in the water sample.'),
});
export type ExplainAlgaeImplicationsInput = z.infer<typeof ExplainAlgaeImplicationsInputSchema>;

const ExplainAlgaeImplicationsOutputSchema = z.object({
  explanation: z.string().describe('A detailed explanation of the potential implications of the detected algae content.'),
});
export type ExplainAlgaeImplicationsOutput = z.infer<typeof ExplainAlgaeImplicationsOutputSchema>;

export async function explainAlgaeImplications(input: ExplainAlgaeImplicationsInput): Promise<ExplainAlgaeImplicationsOutput> {
  return explainAlgaeImplicationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainAlgaeImplicationsPrompt',
  input: {schema: ExplainAlgaeImplicationsInputSchema},
  output: {schema: ExplainAlgaeImplicationsOutputSchema},
  prompt: `You are an expert in water quality analysis. Based on the detected algae content in a water sample, provide a detailed explanation of its potential implications on the water quality and ecosystem.\n\nAlgae Content: {{{algaeContent}}}`,
});

const explainAlgaeImplicationsFlow = ai.defineFlow(
  {
    name: 'explainAlgaeImplicationsFlow',
    inputSchema: ExplainAlgaeImplicationsInputSchema,
    outputSchema: ExplainAlgaeImplicationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
