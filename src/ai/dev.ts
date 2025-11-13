import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-sample-history.ts';
import '@/ai/flows/analyze-algae-content.ts';
import '@/ai/flows/explain-algae-implications.ts';