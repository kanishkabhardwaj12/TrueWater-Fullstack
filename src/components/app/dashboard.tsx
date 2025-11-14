"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  Firestore,
  Timestamp,
} from "firebase/firestore";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import type { Sample, AnalysisState } from "@/lib/types";
import { analyzeImage, getHistorySummary } from "@/lib/actions";
import Header from "./header";
import HistorySidebar from "./history-sidebar";
import AnalysisSection from "./analysis-section";
import MapSection from "./map-section";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function Dashboard() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisState | null>(null);
  const [isPending, startTransition] = useTransition();

  const waterSamplesCollection = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, "waterSamples"),
            orderBy("dateOfTest", "desc")
          )
        : null,
    [firestore]
  );

  const {
    data: samples,
    isLoading: isLoadingSamples,
    error: samplesError,
  } = useCollection<Sample>(waterSamplesCollection);

  useEffect(() => {
    if (samples && samples.length > 0 && !selectedSample) {
      handleSelectSample(samples[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [samples]);
  
  if (samplesError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">
          Could not load samples. Check Firestore connection and permissions.
        </p>
      </div>
    );
  }

  const handleSelectSample = (sample: Sample) => {
    setSelectedSample(sample);
    setAnalysis(null); // Clear previous analysis

    startTransition(async () => {
      if (!sample) return;

      const algaeContent = sample.algaeContent || [];
      const explanation =
        sample.explanation ||
        "This is a historical analysis. To get a fresh explanation, please re-analyze the sample image if needed.";

      const initialAnalysis: AnalysisState = {
        algaeAnalysis: algaeContent,
        explanation: explanation,
      };

      if (samples && sample.testId) {
        const relatedSamples = samples
          .filter((s) => s.testId === sample.testId)
          .sort((a, b) => a.testNumber - b.testNumber);

        if (relatedSamples.length > 1) {
          try {
            const summary = await getHistorySummary(relatedSamples);
            initialAnalysis.historySummary = summary;
          } catch (error) {
            console.error("Failed to get history summary:", error);
            initialAnalysis.historySummary = "Could not load history summary.";
          }
        }
      }
      setAnalysis(initialAnalysis);
    });
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      const dataUri = reader.result as string;
      const optimisticId = `TEMP-${Date.now()}`;

      const newSample: Sample = {
        id: optimisticId,
        testId: `TEST-${Date.now()}`,
        testNumber: 1,
        dateOfTest: new Date().toISOString(),
        location: {
          name: "New Upload (Delhi NCR)",
          lat: 28.7041,
          lng: 77.1025,
        },
        imageUrl: dataUri,
        imageHint: "water sample",
        algaeContent: [],
        explanation: "Analyzing, please wait...",
      };

      setSelectedSample(newSample);
      setAnalysis({
        algaeAnalysis: [],
        explanation: "Analyzing, please wait...",
      });

      startTransition(async () => {
        try {
          const result = await analyzeImage(dataUri);

          if (!result || !result.algaeAnalysis) {
            throw new Error("Analysis returned an invalid result.");
          }
          
          setAnalysis(result);

          if (!firestore) {
            throw new Error("Firestore is not initialized");
          }

          const newSampleData = {
            testId: newSample.testId,
            testNumber: newSample.testNumber,
            dateOfTest: serverTimestamp(),
            sourceWaterLocationLatitude: newSample.location.lat,
            sourceWaterLocationLongitude: newSample.location.lng,
            locationName: newSample.location.name,
            sampleImageUrl: dataUri, // In a real app, this would be an uploaded URL
            algaeContent: result.algaeAnalysis,
            explanation: result.explanation,
          };
          const samplesCollection = collection(firestore, "waterSamples");
          
          addDoc(samplesCollection, newSampleData).catch(
            async (serverError) => {
              const permissionError = new FirestorePermissionError({
                path: samplesCollection.path,
                operation: "create",
                requestResourceData: newSampleData,
              });

              errorEmitter.emit("permission-error", permissionError);

              toast({
                variant: "destructive",
                title: "Permission Denied",
                description: "You do not have permission to save new samples.",
              });
               if (samples && samples.length > 0) {
                 handleSelectSample(samples[0]);
               } else {
                 setSelectedSample(null);
               }
            }
          );


          toast({
            title: "Analysis Complete",
            description: `Found ${result.algaeAnalysis.reduce(
              (sum, a) => sum + a.count,
              0
            )} algae microbes. Saving sample...`,
          });
        } catch (error) {
          console.error("Analysis or saving failed:", error);
          toast({
            variant: "destructive",
            title: "Analysis Failed",
            description:
              error instanceof Error
                ? error.message
                : "An unknown error occurred during analysis.",
          });
          // Revert to previous sample if it exists
          if (samples && samples.length > 0) {
            handleSelectSample(samples[0]);
          } else {
            setSelectedSample(null);
          }
        }
      });
    };
  };

  return (
    <SidebarProvider>
      <HistorySidebar
        samples={samples || []}
        selectedSample={selectedSample}
        onSelectSample={handleSelectSample}
        onImageUpload={handleImageUpload}
        isLoading={isPending || isLoadingSamples}
      />
      <SidebarInset>
        <Header />
        <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
          <AnalysisSection
            selectedSample={selectedSample}
            analysis={analysis}
            isLoading={isPending}
          />
          <MapSection
            samples={samples || []}
            selectedSample={selectedSample}
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
