import { Timestamp } from 'firebase/firestore';

export type Algae = {
  name: string;
  count: number;
};

export type Sample = {
  id: string; // Document ID from Firestore
  testId: string;
  testNumber: number;
  date: string | Timestamp; // Can be string from old data or Timestamp from Firestore
  location: {
    name: string;
    lat: number;
    lng: number;
  };
  imageUrl: string;
  imageHint: string;
  algaeContent: Algae[];
};

export type AnalysisState = {
  algaeAnalysis: Algae[];
  explanation: string;
  historySummary?: string;
};
