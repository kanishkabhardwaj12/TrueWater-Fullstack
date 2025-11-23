'use server';

/**
 * @fileOverview Analyzes an image of a water sample to identify and quantify the types of algae present, including bounding boxes.
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
      "A photo of a water sample, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeAlgaeContentInput = z.infer<typeof AnalyzeAlgaeContentInputSchema>;

const BoundingBoxSchema = z.object({
  x: z.number().describe('The x-coordinate of the top-left corner of the bounding box.'),
  y: z.number().describe('The y-coordinate of the top-left corner of the bounding box.'),
  width: z.number().describe('The width of the bounding box.'),
  height: z.number().describe('The height of the bounding box.'),
});

const AlgaeClassificationSchema = z.object({
  name: z.string().describe('The name of the algae species.'),
  count: z.number().describe('The number of times this algae species was found in the sample.'),
  boundingBoxes: z.array(BoundingBoxSchema).optional().describe('An array of bounding boxes for each detected instance of this algae type.'),
});

const AnalyzeAlgaeContentOutputSchema = z.object({
  algaeAnalysis: z.array(AlgaeClassificationSchema).describe('An array of algae classifications found in the water sample.').default([]),
});

export type AnalyzeAlgaeContentOutput = z.infer<typeof AnalyzeAlgaeContentOutputSchema>;

export async function analyzeAlgaeContent(input: AnalyzeAlgaeContentInput): Promise<AnalyzeAlgaeContentOutput> {
  return analyzeAlgaeContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeAlgaeContentPrompt',
  input: {schema: AnalyzeAlgaeContentInputSchema},
  output: {schema: AnalyzeAlgaeContentOutputSchema},
  prompt: `You are an expert in identifying and quantifying algae species in water samples from images.

  Analyze the provided image of a water sample. Identify the types and quantities of algae present. For each identified algae instance, provide its species name and a bounding box (x, y, width, height) relative to the image dimensions (e.g., values between 0.0 and 1.0).
  
  Group the results by algae name, provide a total count for each, and list all bounding boxes for that species.

  If no algae is detected, return an empty array for the algaeAnalysis field.

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
    return output || { algaeAnalysis: [] };
  }
);
