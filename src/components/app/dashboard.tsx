'use client';

import { useState, useEffect, useTransition } from 'react';
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

type DashboardProps = {
  initialSamples: Sample[];
};

export default function Dashboard({ initialSamples }: DashboardProps) {
  const [samples, setSamples] = useState<Sample[]>(initialSamples);
  const [selectedSample, setSelectedSample] = useState<Sample | null>(
    samples[0] || null
  );
  const [analysis, setAnalysis] = useState<AnalysisState | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    if (selectedSample) {
      const initialAnalysis: AnalysisState = {
        algaeAnalysis: selectedSample.algaeContent,
        explanation: 'This is a historical analysis. To get a fresh explanation, please re-analyze the sample image if needed.',
      };
      
      const relatedSamples = samples.filter(s => s.testID === selectedSample.testID).sort((a,b) => a.testNumber - b.testNumber);

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
        testID: `NEW-${Date.now()}`,
        testNumber: 1,
        date: new Date().toISOString().split('T')[0],
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
          // Note: In a real app, you would save the new sample and its analysis to the database.
          // For this demo, we just show the result.
        } catch (error) {
          toast({
            variant: 'destructive',
            title: 'Analysis Failed',
            description:
              error instanceof Error
                ? error.message
                : 'An unknown error occurred.',
          });
          setSelectedSample(samples[0] || null); // Revert to a known good state
        }
      });
    };
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <Sidebar>
          <HistorySidebar
            samples={samples}
            selectedSample={selectedSample}
            onSelectSample={handleSelectSample}
            onImageUpload={handleImageUpload}
            isLoading={isPending}
          />
        </Sidebar>
        <SidebarInset>
          <Header />
          <main className="flex-1 p-4 md:p-6 space-y-6">
            <AnalysisSection
              selectedSample={selectedSample}
              analysis={analysis}
              isLoading={isPending}
            />
            <MapSection samples={samples} selectedSample={selectedSample} />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
