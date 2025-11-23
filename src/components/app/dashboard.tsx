
'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import {
  collection,
  addDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { Sample, AnalysisState } from '@/lib/types';
import { analyzeImage, getHistorySummary, getAnalysisExplanation } from '@/lib/actions';
import Header from './header';
import HistorySidebar from './history-sidebar';
import AnalysisSection from './analysis-section';
import MapSection from './map-section';
import { useToast } from '@/hooks/use-toast';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AddSampleDialog } from './add-sample-dialog';

const getSampleLocation = (sample: Sample) => {
  return {
    name: sample.locationName || `Sample from ${sample.sourceWaterLocationLatitude.toFixed(4)}, ${sample.sourceWaterLocationLongitude.toFixed(4)}`,
    lat: sample.sourceWaterLocationLatitude,
    lng: sample.sourceWaterLocationLongitude,
  };
};

const getSampleImageUrl = (sample: Sample) => {
    return sample.sampleImageUrl || '';
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
  } = useCollection<Sample>(waterSamplesCollection);

  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisState | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState<{file: File, isRetest: boolean} | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    if (samples && samples.length > 0 && !selectedSample) {
      const sortedSamples = [...samples].sort((a,b) => b.dateOfTest.toMillis() - a.dateOfTest.toMillis());
      handleSelectSample(sortedSamples[0]);
    }
  }, [samples, selectedSample]);

  const handleSelectSample = (sample: Sample) => {
    setSelectedSample(sample);
    setAnalysis(null); // Clear old analysis

    startTransition(async () => {
      if (!firestore || !samples) return;
      
      const initialAnalysis: AnalysisState = {
        algaeAnalysis: sample.algaeContent || [],
        explanation: 'Loading explanation...',
        historySummary: 'Loading history...'
      };
      setAnalysis(initialAnalysis);

      // Fetch explanation
      const explanation = await getAnalysisExplanation(sample.algaeContent || []);
      setAnalysis(prev => (prev ? { ...prev, explanation } : null));

      // Client-side filtering and sorting for history
      const relatedSamples = samples
        .filter(s => s.testId === sample.testId)
        .sort((a, b) => a.testNumber - b.testNumber);

      if (relatedSamples.length > 1) {
         const serializableHistory = relatedSamples.map(s => ({
          ...s,
          dateOfTest: s.dateOfTest.toDate().toISOString(),
        }));
        const summary = await getHistorySummary(serializableHistory);
        setAnalysis(prev => (prev ? { ...prev, historySummary: summary } : null));
      } else {
        setAnalysis(prev => (prev ? { ...prev, historySummary: 'No previous test history for this sample.' } : null));
      }
    });
  };

  const handleOpenDialog = (file: File, isRetest = false) => {
    if (isRetest && !selectedSample) {
        toast({
            variant: 'destructive',
            title: 'No Sample Selected',
            description: 'Please select a sample from the history to re-test.',
        });
        return;
    }
    setDialogData({ file, isRetest });
    setDialogOpen(true);
  };
  
  const handleImageUpload = ({ file, locationName, latitude, longitude, isRetest }: { file: File, locationName: string, latitude: number, longitude: number, isRetest: boolean }) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const dataUri = reader.result as string;
        
        startTransition(async () => {
            try {
              if (!firestore || !waterSamplesCollection) {
                throw new Error("Firestore is not initialized.");
              }
                let testId, testNumber;

                if (isRetest && selectedSample) {
                    testId = selectedSample.testId;
                    // Get the last test number via client-side filtering
                    const lastTest = samples
                      ?.filter(s => s.testId === testId)
                      .sort((a,b) => b.testNumber - a.testNumber)[0];
                    testNumber = (lastTest?.testNumber || 0) + 1;
                } else {
                    testId = `TID-${Date.now()}`;
                    testNumber = 1;
                }

                // Optimistic UI update
                const tempSample: Sample = {
                    id: `TEMP-${Date.now()}`,
                    testId,
                    testNumber,
                    dateOfTest: Timestamp.now(),
                    sourceWaterLocationLatitude: latitude,
                    sourceWaterLocationLongitude: longitude,
                    locationName,
                    sampleImageUrl: dataUri,
                    algaeContent: [],
                };
                setSelectedSample(tempSample);
                setAnalysis(null);

                const result = await analyzeImage(dataUri);

                if (result && result.algaeAnalysis) {
                    setAnalysis(result);

                    const newSampleData = {
                        testId,
                        testNumber,
                        dateOfTest: serverTimestamp(),
                        sourceWaterLocationLatitude: latitude,
                        sourceWaterLocationLongitude: longitude,
                        locationName,
                        sampleImageUrl: dataUri, // In a real app, upload to Cloud Storage first
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
                } else {
                    setAnalysis({
                        algaeAnalysis: [],
                        explanation: 'No algae content was detected.',
                        historySummary: ''
                    });
                    toast({
                        variant: 'default',
                        title: 'Analysis Complete',
                        description: 'The AI analysis did not detect any algae content.',
                    });
                }
            } catch (error) {
                console.error("Upload failed", error);
                toast({
                    variant: 'destructive',
                    title: 'Analysis Failed',
                    description: error instanceof Error ? error.message : 'An unknown error occurred.',
                });
                 if (samples && samples.length > 0) {
                    const sortedSamples = [...samples].sort((a,b) => b.dateOfTest.toMillis() - a.dateOfTest.toMillis());
                    handleSelectSample(sortedSamples[0]);
                }
            } finally {
                setDialogOpen(false);
            }
        });
    };
  };

  const displaySamples = useMemo(() => samples?.map(s => ({
    ...s,
    location: getSampleLocation(s),
    imageUrl: getSampleImageUrl(s),
  })) || [], [samples]);

  const displaySelectedSample = useMemo(() => {
    if (!selectedSample) return null;
    return {
      ...selectedSample,
      location: getSampleLocation(selectedSample),
      imageUrl: getSampleImageUrl(selectedSample),
    }
  }, [selectedSample]);

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <HistorySidebar
          samples={displaySamples}
          selectedSample={displaySelectedSample}
          onSelectSample={handleSelectSample}
          onImageUpload={(file) => handleOpenDialog(file, false)}
          onRetest={(file) => handleOpenDialog(file, true)}
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
      <AddSampleDialog
        isOpen={isDialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleImageUpload}
        isRetest={dialogData?.isRetest ?? false}
        file={dialogData?.file ?? null}
        isLoading={isPending}
        selectedSample={selectedSample}
      />
    </SidebarProvider>
  );
}
