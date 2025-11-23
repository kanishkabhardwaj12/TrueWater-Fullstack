
'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Sample, AnalysisState } from '@/lib/types';
import { FileText, Microscope, History } from 'lucide-react';
  
interface AnalysisSectionProps {
  selectedSample: (Sample & { location: any; imageUrl: string }) | null;
  analysis: AnalysisState | null;
  isLoading: boolean;
}

export default function AnalysisSection({
  selectedSample,
  analysis,
  isLoading,
}: AnalysisSectionProps) {
  const cleanWaterImage = PlaceHolderImages.find(
    (img) => img.id === 'clean-water'
  );

  const uploadedImageRef = useRef<HTMLImageElement>(null);
  
  const [key, setKey] = useState(Date.now());
  useEffect(() => {
    // When the selected sample or analysis changes, update the key to force re-render
    setKey(Date.now());
  }, [selectedSample, analysis]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-primary">
        <CardHeader>
          <CardTitle className="text-xl font-bold tracking-tight">Reference: Clean Sample</CardTitle>
        </CardHeader>
        <CardContent>
          {cleanWaterImage ? (
            <Image
              src={cleanWaterImage.imageUrl}
              alt={cleanWaterImage.description}
              width={600}
              height={400}
              className="rounded-lg object-cover w-full aspect-video hover:scale-105 transition-transform duration-300"
              data-ai-hint={cleanWaterImage.imageHint}
              priority
            />
          ) : (
            <Skeleton className="w-full aspect-video rounded-lg" />
          )}
        </CardContent>
      </Card>
      <Card className="shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-primary">
        <CardHeader>
          <CardTitle className="text-xl font-bold tracking-tight">Your Uploaded Sample</CardTitle>
        </CardHeader>
        <CardContent>
           <div className="relative">
            {isLoading && !selectedSample ? (
              <Skeleton className="w-full aspect-video rounded-lg" />
            ) : selectedSample ? (
              <>
                <Image
                  key={selectedSample.id} // Force re-mount on sample change
                  ref={uploadedImageRef}
                  src={selectedSample.imageUrl}
                  alt={`Water sample from ${selectedSample.location?.name ?? 'Unknown'}`}
                  width={600}
                  height={400}
                  className="rounded-lg object-cover w-full aspect-video hover:scale-105 transition-transform duration-300"
                  crossOrigin="anonymous" // Add this for images from different origins
                />
              </>
            ) : (
              <div className="flex items-center justify-center w-full aspect-video bg-muted/50 rounded-lg border-2 border-dashed border-border">
                <div className="text-center p-4">
                  <p className="text-xl font-semibold text-muted-foreground">No Sample Selected</p>
                  <p className="text-md text-muted-foreground mt-2">Upload or choose a sample from the history to begin.</p>
                </div>
              </div>
            )}
           </div>
        </CardContent>
      </Card>
      <div className="lg:col-span-2">
        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight text-center">AI-Powered Analysis & Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-muted/50 rounded-lg h-12 p-1">
                <TabsTrigger value="content" className="text-base font-semibold rounded-md">
                  <Microscope className="mr-2 h-5 w-5" /> Algae Content
                </TabsTrigger>
                <TabsTrigger value="implications" className="text-base font-semibold rounded-md">
                  <FileText className="mr-2 h-5 w-5" /> Implications
                </TabsTrigger>
                <TabsTrigger value="history" className="text-base font-semibold rounded-md">
                  <History className="mr-2 h-5 w-5" /> History Summary
                </TabsTrigger>
              </TabsList>
              <TabsContent value="content" className="mt-6">
                <Card className="border-0 shadow-none">
                  <CardContent className="p-0">
                    {isLoading && !analysis ? (
                      <div className="space-y-4 p-6">
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-20 w-full" />
                      </div>
                    ) : (
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-transparent">
                              <TableHead className="text-lg font-semibold text-foreground/90">Algae Type</TableHead>
                              <TableHead className="text-right text-lg font-semibold text-foreground/90">Count</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(analysis?.algaeAnalysis.length ?? 0) > 0 ? (
                              analysis?.algaeAnalysis.map((algae) => (
                                <TableRow key={algae.name} className="text-base">
                                  <TableCell className="font-medium">{algae.name}</TableCell>
                                  <TableCell className="text-right">
                                    <Badge variant={algae.count > 100 ? "destructive" : "secondary"} className="text-md px-3 py-1">
                                      {algae.count}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={2} className="text-center h-48 text-muted-foreground text-lg">
                                  No algae content detected or sample not analyzed.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="implications" className="mt-6">
                 <Card className="border-0 shadow-none">
                  <CardContent className="p-6 min-h-[240px] bg-muted/30 rounded-lg">
                    {isLoading || analysis?.explanation === 'Loading explanation...' ? (
                       <div className="space-y-3 p-2">
                          <Skeleton className="h-5 w-full" />
                          <Skeleton className="h-5 w-full" />
                          <Skeleton className="h-5 w-4/5" />
                       </div>
                    ) : (
                      <p className="text-lg text-foreground/90 leading-relaxed whitespace-pre-wrap">
                        {analysis?.explanation || 'No implications to show. Analyze a sample first.'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
               <TabsContent value="history" className="mt-6">
                 <Card className="border-0 shadow-none">
                  <CardContent className="p-6 min-h-[240px] bg-muted/30 rounded-lg">
                    {isLoading || analysis?.historySummary === 'Loading history...' ? (
                       <div className="space-y-3 p-2">
                          <Skeleton className="h-5 w-full" />
                          <Skeleton className="h-5 w-full" />
                          <Skeleton className="h-5 w-4/5" />
                       </div>
                    ) : (
                      <p className="text-lg text-foreground/90 leading-relaxed whitespace-pre-wrap">
                        {analysis?.historySummary || 'No history summary available. Select a sample with multiple tests.'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
