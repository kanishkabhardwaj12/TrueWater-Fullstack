import { Timestamp } from 'firebase/firestore';

export type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Algae = {
  name: string;
  count: number;
  boundingBoxes?: BoundingBox[];
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
  locationName?: string; // Added for clarity
  // Deprecated fields
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
