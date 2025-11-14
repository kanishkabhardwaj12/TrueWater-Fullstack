import { Timestamp } from 'firebase/firestore';

export type Algae = {
  name: string;
  count: number;
};

export type Sample = {
  id: string; // Document ID from Firestore
  testId: string;
  testNumber: number;
  dateOfTest: string | Timestamp; // Stored as Timestamp in Firestore
  locationName: string;
  sourceWaterLocationLatitude: number;
  sourceWaterLocationLongitude: number;
  sampleImageUrl: string;
  imageHint: string;
  algaeContent: Algae[];
  explanation: string;
};

export type AnalysisState = {
  algaeAnalysis: Algae[];
  explanation: string;
  historySummary?: string;
};
