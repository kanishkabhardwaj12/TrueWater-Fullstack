'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import {
  collection,
  query,
  where,
  addDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { Sample, AnalysisState } from '@/lib/types';
import { analyzeImage, getHistorySummary } from '@/lib/actions';
import Header from './header';
import HistorySidebar from './history-sidebar';
import AnalysisSection from './analysis-section';
import MapSection from './map-section';
import { useToast } from '@/hooks/use-toast';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';

// Helper function to get a consistent location object
const getSampleLocation = (sample: Sample) => {
  if (sample.location) {
    return sample.location;
  }
  return {
    name: `Sample from ${sample.sourceWaterLocationLatitude.toFixed(4)}, ${sample.sourceWaterLocationLongitude.toFixed(4)}`,
    lat: sample.sourceWaterLocationLatitude,
    lng: sample.sourceWaterLocationLongitude,
  };
};

// Helper to get a consistent image URL
const getSampleImageUrl = (sample: Sample) => {
    return sample.sampleImageUrl || sample.imageUrl || '';
}


export default function Dashboard() {
  const firestore = useFirestore();
  const waterSamplesCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'waterSamples') : null),
    [firestore]
  );
  const {
    data: samples,
    isLoading: isLoadingSamples,
    error: samplesError,
  } = useCollection<Sample>(waterSamplesCollection);

  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisState | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    if (samples && samples.length > 0 && !selectedSample) {
      setSelectedSample(samples[0]);
    }
  }, [samples, selectedSample]);

  useEffect(() => {
    if (selectedSample && samples) {
      const initialAnalysis: AnalysisState = {
        algaeAnalysis: selectedSample.algaeContent || [],
        explanation:
          'This is a historical analysis. To get a fresh explanation, please re-analyze the sample image if needed.',
      };

      const relatedSamples = samples
        .filter((s) => s.testId === selectedSample.testId)
        .sort((a, b) => a.testNumber - b.testNumber);

      if (relatedSamples.length > 1) {
        startTransition(async () => {
          const summary = await getHistorySummary(relatedSamples);
          initialAnalysis.historySummary = summary;
          setAnalysis(initialAnalysis);
        });
      } else {
        setAnalysis(initialAnalysis);
      }
    }
  }, [selectedSample, samples]);

  const handleSelectSample = (sample: Sample) => {
    setSelectedSample(sample);
    setAnalysis(null);
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const dataUri = reader.result as string;
      const newTestId = `NEW-${Date.now()}`;

      // This is a temporary client-side object for display purposes.
      const tempSample: Sample = {
        id: newTestId,
        testId: newTestId,
        testNumber: 1,
        dateOfTest: Timestamp.now(),
        sourceWaterLocationLatitude: 28.7041,
        sourceWaterLocationLongitude: 77.1025,
        sampleImageUrl: dataUri,
        algaeContent: [],
      };

      setSelectedSample(tempSample);
      setAnalysis(null);

      startTransition(async () => {
        try {
          const result = await analyzeImage(dataUri);

          if (result && result.algaeAnalysis) {
            setAnalysis(result);

            if (waterSamplesCollection) {
              const newSampleData = {
                testId: tempSample.testId,
                testNumber: tempSample.testNumber,
                dateOfTest: serverTimestamp(),
                sourceWaterLocationLatitude: tempSample.sourceWaterLocationLatitude,
                sourceWaterLocationLongitude: tempSample.sourceWaterLocationLongitude,
                sampleImageUrl: tempSample.sampleImageUrl, // In a real app, upload to Cloud Storage first
                algaeContent: result.algaeAnalysis.map((algae) => ({
                  name: algae.name,
                  count: algae.count,
                })),
              };

              await addDoc(waterSamplesCollection, newSampleData);

              toast({
                title: 'Analysis Complete',
                description: 'New sample has been saved to the database.',
              });
            }
          } else {
            setAnalysis({
              algaeAnalysis: [],
              explanation: 'No algae content was detected.',
            });
            toast({
              variant: 'default',
              title: 'Analysis Complete',
              description:
                'The AI analysis did not detect any algae content.',
            });
          }
        } catch (error) {
          toast({
            variant: 'destructive',
            title: 'Analysis Failed',
            description:
              error instanceof Error
                ? error.message
                : 'An unknown error occurred.',
          });
          if (samples && samples.length > 0) {
            setSelectedSample(samples[0] || null); // Revert to a known good state
          }
        }
      });
    };
  };
  
  const displaySamples = useMemo(() => samples?.map(s => ({
    ...s,
    location: getSampleLocation(s),
    imageUrl: getSampleImageUrl(s),
  })) || [], [samples])

  const displaySelectedSample = useMemo(() => {
    if (!selectedSample) return null;
    return {
      ...selectedSample,
      location: getSampleLocation(selectedSample),
      imageUrl: getSampleImageUrl(selectedSample),
    }
  }, [selectedSample])


  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <HistorySidebar
          samples={displaySamples}
          selectedSample={displaySelectedSample}
          onSelectSample={handleSelectSample}
          onImageUpload={handleImageUpload}
          isLoading={isPending || isLoadingSamples}
        />
      </Sidebar>
      <SidebarInset className="bg-transparent">
        <Header />
        <main className="flex-1 p-6 md:p-8 space-y-8">
          <AnalysisSection
            selectedSample={displaySelectedSample}
            analysis={analysis}
            isLoading={isPending || isLoadingSamples}
          />
          <MapSection
            samples={displaySamples}
            selectedSample={displaySelectedSample}
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
