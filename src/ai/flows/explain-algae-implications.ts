
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
  algaeContent: z.string().describe('A comma-separated string of detected algae and their counts (e.g., "Microcystis: 50, Anabaena: 20").'),
});
export type ExplainAlgaeImplicationsInput = z.infer<typeof ExplainAlgaeImplicationsInputSchema>;

const ExplainAlgaeImplicationsOutputSchema = z.object({
  explanation: z.string().describe('A detailed explanation of the potential implications of the detected algae content on water quality, ecosystem, and potential health risks. Explain it in simple terms for a non-expert.'),
});
export type ExplainAlgaeImplicationsOutput = z.infer<typeof ExplainAlgaeImplicationsOutputSchema>;

export async function explainAlgaeImplications(input: ExplainAlgaeImplicationsInput): Promise<ExplainAlgaeImplicationsOutput> {
  return explainAlgaeImplicationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainAlgaeImplicationsPrompt',
  input: {schema: ExplainAlgaeImplicationsInputSchema},
  output: {schema: ExplainAlgaeImplicationsOutputSchema},
  prompt: `You are an expert in water quality analysis and public health. Based on the detected algae content in a water sample, provide a detailed, easy-to-understand explanation of its potential implications.

  Cover the following points:
  1.  **Overall Water Quality**: What does this algae presence mean for the general health of the water body?
  2.  **Ecosystem Impact**: How might this affect fish, plants, and other aquatic life?
  3.  **Human Health & Safety**: Are there any risks associated with swimming, drinking, or other contact with this water? Mention any potential toxins.
  4.  **Recommendations**: Provide simple, actionable advice for the person who took the sample.
  
  Write the explanation in clear, non-technical language.

  Detected Algae Content: {{{algaeContent}}}`,
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
