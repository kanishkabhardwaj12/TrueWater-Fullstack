import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// --- 🛠️ SINGLETON SETUP ---
const globalForGenkit = global as unknown as { ai: any };
const ai = globalForGenkit.ai || genkit({
  plugins: [googleAI()],
});
if (process.env.NODE_ENV !== 'production') globalForGenkit.ai = ai;

// Define the Schema
export const AlgaeInputSchema = z.object({
  total_count: z.number(),
  detailed_counts: z.array(
    z.object({
      algaeName: z.string(),
      count: z.number(),
    })
  ),
});

// Define the Flow
export const getAlgaeInsightFlow = ai.defineFlow(
  {
    name: 'getAlgaeInsight',
    inputSchema: AlgaeInputSchema,
    outputSchema: z.string(),
  },
  async (analysis: z.infer<typeof AlgaeInputSchema>) => {
    const prompt = `
      You are a senior environmental biologist.
      Analyze this algae data:
      - Total Count: ${analysis.total_count}
      - Species: ${JSON.stringify(analysis.detailed_counts)}

      Provide a brief analysis and 1 recommended action.
    `;

    const { text } = await ai.generate({
      // 👇 FIX: Added 'googleai/' prefix here
      model: 'googleai/gemini-1.5-flash',
      prompt: prompt,
    });

    return text;
  }
);