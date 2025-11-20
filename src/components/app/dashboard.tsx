"use client";

import { useState, useEffect, useTransition } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
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
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { cn } from "@/lib/utils";
import AddSampleDialog from "./add-sample-dialog";

function DashboardContent() {
  const firestore = useFirestore();
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisState | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { isMobile, state } = useSidebar();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadContext, setUploadContext] = useState<{
    file: File;
    isRetest: boolean;
  } | null>(null);


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
        historySummary: 'No historical data for this sample.',
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

  const handleOpenDialog = (file: File, isRetest: boolean) => {
    setUploadContext({ file, isRetest });
    setIsDialogOpen(true);
  };
  
  const handleDialogSubmit = ({ locationName }: { locationName: string }) => {
    if (!uploadContext) return;
    const { file, isRetest } = uploadContext;
  
    const reader = new FileReader();
    reader.readAsDataURL(file);
  
    reader.onload = () => {
      const dataUri = reader.result as string;
  
      const testId = isRetest && selectedSample
        ? selectedSample.testId
        : `TEST-${Date.now()}`;
      
      const testNumber = isRetest && selectedSample && samples
        ? samples.filter(s => s.testId === selectedSample.testId).length + 1
        : 1;
  
      const optimisticSample: Sample = {
        id: `TEMP-${Date.now()}`,
        testId: testId,
        testNumber: testNumber,
        dateOfTest: new Date().toISOString(),
        locationName: isRetest && selectedSample ? selectedSample.locationName : locationName,
        sourceWaterLocationLatitude: isRetest && selectedSample ? selectedSample.sourceWaterLocationLatitude : 28.7041,
        sourceWaterLocationLongitude: isRetest && selectedSample ? selectedSample.sourceWaterLocationLongitude : 77.1025,
        sampleImageUrl: dataUri,
        imageHint: "water sample",
        algaeContent: [],
        explanation: "Analyzing, please wait...",
      };
  
      setSelectedSample(optimisticSample);
      setAnalysis({ algaeAnalysis: [], explanation: "Analyzing, please wait..." });
  
      startTransition(async () => {
        try {
          const result = await analyzeImage(dataUri);
  
          if (!firestore) {
            throw new Error("Firestore is not initialized");
          }
  
          const newSampleData = {
            testId: optimisticSample.testId,
            testNumber: optimisticSample.testNumber,
            dateOfTest: serverTimestamp(),
            sourceWaterLocationLatitude: optimisticSample.sourceWaterLocationLatitude,
            sourceWaterLocationLongitude: optimisticSample.sourceWaterLocationLongitude,
            locationName: optimisticSample.locationName,
            sampleImageUrl: dataUri, // In a real app, this should be an uploaded URL
            algaeContent: result.algaeAnalysis,
            explanation: result.explanation,
          };
          
          const samplesCollection = collection(firestore, "waterSamples");
          await addDoc(samplesCollection, newSampleData).catch(
            async (serverError) => {
              const permissionError = new FirestorePermissionError({
                path: samplesCollection.path,
                operation: "create",
                requestResourceData: newSampleData,
              });
  
              errorEmitter.emit("permission-error", permissionError);
            }
          );
  
          setAnalysis(result);
  
          toast({
            title: "Analysis Complete",
            description: `Found ${result.algaeAnalysis.reduce((sum, a) => sum + a.count, 0)} algae microbes. Sample saved.`,
          });
        } catch (error) {
          console.error("Analysis or saving failed:", error);
          toast({
            variant: "destructive",
            title: "Analysis Failed",
            description: error instanceof Error ? error.message : "An unknown error occurred during analysis.",
          });
          // Revert to previous state
          if (samples && samples.length > 0) {
            handleSelectSample(samples[0]);
          } else {
            setSelectedSample(null);
          }
        }
      });
    };
  
    setIsDialogOpen(false);
    setUploadContext(null);
  };
  
  if (isLoadingSamples && !samples) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading samples...</p>
      </div>
    );
  }

  if (samplesError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500 text-center">
          <p className="font-bold mb-2">Could not load samples.</p>
          <p className="text-sm">{samplesError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <AddSampleDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleDialogSubmit}
        isRetest={uploadContext?.isRetest ?? false}
        sampleLocation={selectedSample?.locationName}
        isLoading={isPending}
      />
    <div className="min-h-screen w-full bg-muted/40">
      <HistorySidebar
        samples={samples || []}
        selectedSample={selectedSample}
        onSelectSample={handleSelectSample}
        onImageUpload={handleOpenDialog}
        isLoading={isPending || isLoadingSamples}
      />
      <div
        className={cn(
          'flex flex-col transition-[margin-left] ease-in-out duration-300',
          !isMobile && state === 'expanded' ? 'md:ml-64' : ''
        )}
      >
        <Header/>
        <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
          <AnalysisSection
            selectedSample={selectedSample}
            analysis={analysis}
            isLoading={isPending}
            onImageUpload={handleOpenDialog}
          />
          <MapSection
            samples={samples || []}
            selectedSample={selectedSample}
          />
        </main>
      </div>
    </div>
    </>
  );
}


export default function Dashboard() {
  return (
    <SidebarProvider>
      <DashboardContent />
    </SidebarProvider>
  );
}
