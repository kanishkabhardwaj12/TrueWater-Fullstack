"use client";

import { useState, useEffect, useTransition } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import type { Sample, AnalysisState } from "@/lib/types";
import { getHistorySummary } from "@/lib/actions"; // kept for history summary
import Header from "./header";
import HistorySidebar from "./history-sidebar";
import AnalysisSection from "./analysis-section";
import MapSection from "./map-section";
import { useToast } from "@/hooks/use-toast";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";

export default function Dashboard() {
  const firestore = useFirestore();
  const waterSamplesCollection = useMemoFirebase(
    () => collection(firestore, "waterSamples"),
    [firestore]
  );
  const { data: samples, isLoading: isLoadingSamples } = useCollection<Sample>(
    waterSamplesCollection
  );

  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisState | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  // Set initial selection
  useEffect(() => {
    if (samples && samples.length > 0 && !selectedSample) {
      setSelectedSample(samples[0]);
    }
  }, [samples, selectedSample]);

  // Handle history summary when selection changes
  useEffect(() => {
    if (selectedSample && samples) {
      const initialAnalysis: AnalysisState = {
        algaeAnalysis: selectedSample.algaeContent || [],
        explanation:
          "This is a historical analysis. To get a fresh explanation, please re-analyze the sample image if needed.",
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

  // --- 🚀 NEW UPLOAD LOGIC ---
  const handleImageUpload = (file: File) => {
    // 1. Create a local preview immediately
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      const dataUri = reader.result as string;

      // Create a temporary "optimistic" sample to show the user immediately
      const newSample: Sample = {
        id: `TEMP-${Date.now()}`,
        testId: `TEST-${Date.now()}`,
        testNumber: 1,
        date: new Date().toISOString(),
        // Defaulting to Delhi NCR as per blueprint
        location: {
          name: "New Upload (Delhi NCR)",
          lat: 28.7041,
          lng: 77.1025,
        },
        imageUrl: dataUri,
        imageHint: "Analysing...",
        algaeContent: [],
      };

      setSelectedSample(newSample);
      setAnalysis(null); // Clear previous analysis

      // 2. Send to our new API Route
      startTransition(async () => {
        try {
          const formData = new FormData();
          formData.append("file", file);

          // Call the Bridge API (Next.js -> Python -> Genkit)
          const response = await fetch("/api/analyze", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Analysis failed: ${response.statusText}`);
          }

          const result = await response.json();

          // 3. Format the result for the UI
          const formattedAnalysis: AnalysisState = {
            algaeAnalysis: result.counts.detailed_counts.map((item: any) => ({
              name: item.algaeName,
              count: item.count,
            })),
            explanation: result.insight, // Insight from Genkit
          };

          setAnalysis(formattedAnalysis);

          // 4. Save to Firestore
          // Note: In a real production app, you'd upload the image to Firebase Storage first
          // and save the URL here, rather than the huge Data URI.
          await addDoc(waterSamplesCollection, {
            testId: newSample.testId,
            testNumber: newSample.testNumber,
            dateOfTest: serverTimestamp(),
            sourceWaterLocationLatitude: newSample.location.lat,
            sourceWaterLocationLongitude: newSample.location.lng,
            sampleImageUrl: dataUri,
            algaeContent: formattedAnalysis.algaeAnalysis,
          });

          toast({
            title: "Analysis Complete",
            description: `Found ${result.counts.total_count} algae microbes. Saved to database.`,
          });
        } catch (error) {
          console.error(error);
          toast({
            variant: "destructive",
            title: "Analysis Failed",
            description:
              error instanceof Error ? error.message : "Unknown error",
          });

          // Revert to previous sample if it failed
          if (samples && samples.length > 0) {
            setSelectedSample(samples[0]);
          }
        }
      });
    };
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        {" "}
        {/* Added bg-background for theme consistency */}
        <Sidebar>
          <HistorySidebar
            samples={samples || []}
            selectedSample={selectedSample}
            onSelectSample={handleSelectSample}
            onImageUpload={handleImageUpload}
            isLoading={isPending || isLoadingSamples}
          />
        </Sidebar>
        <SidebarInset className="bg-transparent">
          <Header />
          <main className="flex-1 p-6 md:p-8 space-y-8">
            <AnalysisSection
              selectedSample={selectedSample}
              analysis={analysis}
              isLoading={isPending || isLoadingSamples}
            />
            <MapSection
              samples={samples || []}
              selectedSample={selectedSample}
            />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
