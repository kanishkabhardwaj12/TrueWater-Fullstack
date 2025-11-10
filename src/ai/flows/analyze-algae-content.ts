'use server';

/**
 * @fileOverview Analyzes an image of a water sample to identify and quantify the types of algae present.
 *
 * - analyzeAlgaeContent - A function that handles the algae analysis process.
 * - AnalyzeAlgaeContentInput - The input type for the analyzeAlgaeContent function.
 * - AnalyzeAlgaeContentOutput - The return type for the analyzeAlgaeContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeAlgaeContentInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of a water sample, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
});
export type AnalyzeAlgaeContentInput = z.infer<typeof AnalyzeAlgaeContentInputSchema>;

const AlgaeClassificationSchema = z.object({
  name: z.string().describe('The name of the algae species.'),
  count: z.number().describe('The number of times this algae species was found in the sample.'),
});

const AnalyzeAlgaeContentOutputSchema = z.object({
  algaeAnalysis: z.array(AlgaeClassificationSchema).describe('An array of algae classifications found in the water sample.'),
});

export type AnalyzeAlgaeContentOutput = z.infer<typeof AnalyzeAlgaeContentOutputSchema>;

export async function analyzeAlgaeContent(input: AnalyzeAlgaeContentInput): Promise<AnalyzeAlgaeContentOutput> {
  return analyzeAlgaeContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeAlgaeContentPrompt',
  input: {schema: AnalyzeAlgaeContentInputSchema},
  output: {schema: AnalyzeAlgaeContentOutputSchema},
  prompt: `You are an expert in identifying and quantifying algae species in water samples.

  Analyze the provided image of a water sample and identify the types and quantities of algae present. Provide a structured analysis of the algal content, listing each identified species and its count.

  Image: {{media url=photoDataUri}}
  
  Return the analysis in a structured JSON format.
`,
});

const analyzeAlgaeContentFlow = ai.defineFlow(
  {
    name: 'analyzeAlgaeContentFlow',
    inputSchema: AnalyzeAlgaeContentInputSchema,
    outputSchema: AnalyzeAlgaeContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
