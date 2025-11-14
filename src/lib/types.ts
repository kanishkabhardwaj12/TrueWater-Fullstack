import { Timestamp } from 'firebase/firestore';

export type Algae = {
  name: string;
  count: number;
};

export type Sample = {
  id: string; // Document ID from Firestore
  testId: string;
  testNumber: number;
  dateOfTest: Timestamp;
  sourceWaterLocationLatitude: number;
  sourceWaterLocationLongitude: number;
  sampleImageUrl: string;
  algaeContent: Algae[];
  // Deprecated fields that might exist on old documents, for backward compatibility
  date?: string | Timestamp;
  location?: {
    name: string;
    lat: number;
    lng: number;
  };
  imageHint?: string;
  imageUrl?: string;
};

export type AnalysisState = {
  algaeAnalysis: Algae[];
  explanation: string;
  historySummary?: string;
};
