'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import {
  collection,
  query,
  where,
  addDoc,
  serverTimestamp,
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

export default function Dashboard() {
  const firestore = useFirestore();
  const waterSamplesCollection = useMemoFirebase(
    () => collection(firestore, 'waterSamples'),
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
        algaeAnalysis: selectedSample.algaeContent,
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

      const newSample: Sample = {
        id: `NEW-${Date.now()}`,
        testId: `NEW-${Date.now()}`,
        testNumber: 1,
        date: new Date().toISOString(),
        location: { name: 'New Upload', lat: 28.7041, lng: 77.1025 }, // Default to Delhi center
        imageUrl: dataUri,
        imageHint: 'uploaded sample',
        algaeContent: [],
      };

      setSelectedSample(newSample);
      setAnalysis(null);

      startTransition(async () => {
        try {
          const result = await analyzeImage(dataUri);
          setAnalysis(result);
          
          const newSampleData = {
            testId: newSample.testId,
            testNumber: newSample.testNumber,
            dateOfTest: serverTimestamp(),
            sourceWaterLocationLatitude: newSample.location.lat,
            sourceWaterLocationLongitude: newSample.location.lng,
            sampleImageUrl: newSample.imageUrl, // In a real app, upload to Cloud Storage first
            algaeContent: result.algaeAnalysis,
          };

          await addDoc(waterSamplesCollection, newSampleData);

          toast({
            title: 'Analysis Complete',
            description: 'New sample has been saved to the database.',
          });

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

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <Sidebar>
          <HistorySidebar
            samples={samples || []}
            selectedSample={selectedSample}
            onSelectSample={handleSelectSample}
            onImageUpload={handleImageUpload}
            isLoading={isPending || isLoadingSamples}
          />
        </Sidebar>
        <SidebarInset>
          <Header />
          <main className="flex-1 p-4 md:p-6 space-y-6">
            <AnalysisSection
              selectedSample={selectedSample}
              analysis={analysis}
              isLoading={isPending || isLoadingSamples}
            />
            <MapSection samples={samples || []} selectedSample={selectedSample} />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
