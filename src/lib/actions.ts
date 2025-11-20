'use server';

import { analyzeAlgaeContent } from '@/ai/flows/analyze-algae-content';
import { explainAlgaeImplications } from '@/ai/flows/explain-algae-implications';
import { summarizeSampleHistory } from '@/ai/flows/summarize-sample-history';
import type { Sample, Algae } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

export type AnalysisResult = {
  algaeAnalysis: Algae[];
  explanation: string;
};

export async function analyzeImage(
  photoDataUri: string
): Promise<AnalysisResult> {
  if (!photoDataUri) {
    throw new Error('Image data is required.');
  }

  try {
    const analysisResult = await analyzeAlgaeContent({ photoDataUri });
    const algaeContentString = analysisResult.algaeAnalysis
      .map((algae) => `${algae.name}: ${algae.count}`)
      .join(', ');

    if (!algaeContentString) {
      return {
        algaeAnalysis: [],
        explanation: 'No algae content was detected in the sample. The water appears to be clean.',
      };
    }

    const explanationResult = await explainAlgaeImplications({
      algaeContent: algaeContentString,
    });

    return {
      algaeAnalysis: analysisResult.algaeAnalysis,
      explanation: explanationResult.explanation,
    };
  } catch (error) {
    console.error('Error in AI analysis:', error);
    throw new Error('Failed to analyze image. Please try again.');
  }
}

export async function getHistorySummary(
  sampleHistory: Sample[]
): Promise<string> {
  if (!sampleHistory || sampleHistory.length === 0) {
    return 'No history available for this sample.';
  }

  try {
    const formattedHistory = sampleHistory.map((sample) => {
      let dateString: string;
      if (typeof sample.dateOfTest === 'string') {
        dateString = sample.dateOfTest;
      } else if (sample.dateOfTest instanceof Timestamp) {
        dateString = sample.dateOfTest.toDate().toISOString();
      } else if (sample.dateOfTest && 'seconds' in sample.dateOfTest && 'nanoseconds' in sample.dateOfTest) {
        // This handles the plain object from the client
        dateString = new Timestamp(sample.dateOfTest.seconds, sample.dateOfTest.nanoseconds).toDate().toISOString();
      } else {
        dateString = new Date().toISOString(); // Fallback
      }

      return {
        date: dateString,
        algaeContent: sample.algaeContent.reduce(
          (acc, algae) => {
            acc[algae.name] = algae.count;
            return acc;
          },
          {} as Record<string, number>
        ),
        testNumber: sample.testNumber,
      };
    });

    const result = await summarizeSampleHistory({
      sampleHistory: formattedHistory,
    });
    return result.summary;
  } catch (error) {
    console.error('Error generating history summary:', error);
    throw new Error('Failed to generate history summary.');
  }
}
