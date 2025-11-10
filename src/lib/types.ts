export type Algae = {
  name: string;
  count: number;
};

export type Sample = {
  testID: string;
  testNumber: number;
  date: string;
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
