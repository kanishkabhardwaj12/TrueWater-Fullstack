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
  name: z.string().describe('The scientific or common name of the algae species, using snake_case (e.g., blue_green_algae).'),
  count: z.number().describe('The estimated number of times this algae species was found in the sample.'),
});

const AnalyzeAlgaeContentOutputSchema = z.object({
  algaeAnalysis: z.array(AlgaeClassificationSchema).describe('An array of algae classifications found in the water sample. If no algae is found, return an empty array.'),
});

export type AnalyzeAlgaeContentOutput = z.infer<typeof AnalyzeAlgaeContentOutputSchema>;

export async function analyzeAlgaeContent(input: AnalyzeAlgaeContentInput): Promise<AnalyzeAlgaeContentOutput> {
  return analyzeAlgaeContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeAlgaeContentPrompt',
  input: {schema: AnalyzeAlgaeContentInputSchema},
  output: {schema: AnalyzeAlgaeContentOutputSchema},
  prompt: `You are an expert microbiologist specializing in identifying and quantifying algae species from microscopic images of water samples.

  Analyze the provided image of a water sample. Identify the types and quantities of all algae present. Provide a structured analysis of the algal content, listing each identified species and its estimated count. Use snake_case for the species name.

  If the image is clear and contains no discernible algae, return an empty array for the 'algaeAnalysis' field.

  Image: {{media url=photoDataUri}}
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
    return output ?? { algaeAnalysis: [] };
  }
);
