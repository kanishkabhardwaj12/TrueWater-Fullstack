
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
import type { Sample, AnalysisState, BoundingBox as BboxType } from '@/lib/types';
import { FileText, Microscope, History } from 'lucide-react';

type AnalysisSectionProps = {
  selectedSample: (Sample & { location: any; imageUrl: string }) | null;
  analysis: AnalysisState | null;
  isLoading: boolean;
};

const BoundingBox = ({ box, imageRef }: { box: BboxType, imageRef: React.RefObject<HTMLImageElement> }) => {
    const [style, setStyle] = useState<React.CSSProperties>({ display: 'none' });
  
    useEffect(() => {
      const calculatePosition = () => {
        if (imageRef.current) {
          const { naturalWidth, naturalHeight, clientWidth, clientHeight } = imageRef.current;
          
          if (naturalWidth === 0 || naturalHeight === 0) {
            // Image not loaded yet, try again
            return;
          }
          
          const widthRatio = clientWidth / naturalWidth;
          const heightRatio = clientHeight / naturalHeight;
  
          setStyle({
            position: 'absolute',
            left: `${box.x * naturalWidth * widthRatio}px`,
            top: `${box.y * naturalHeight * heightRatio}px`,
            width: `${box.width * naturalWidth * widthRatio}px`,
            height: `${box.height * naturalHeight * heightRatio}px`,
            border: '2px solid yellow',
          });
        }
      };
      
      const imgElement = imageRef.current;
  
      if (imgElement) {
        // If the image is already loaded, calculate immediately.
        if (imgElement.complete) {
          calculatePosition();
        } else {
          // Otherwise, wait for it to load.
          imgElement.onload = calculatePosition;
        }
  
        // Recalculate on window resize.
        window.addEventListener('resize', calculatePosition);
  
        return () => {
          if (imgElement) {
            imgElement.onload = null;
          }
          window.removeEventListener('resize', calculatePosition);
        };
      }
    }, [box, imageRef]);
  
    return <div style={style} />;
};
  

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

  const allBoundingBoxes = analysis?.algaeAnalysis?.flatMap(algae => algae.boundingBoxes || []) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <CardHeader>
          <CardTitle>Reference: Clean Sample</CardTitle>
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
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <CardHeader>
          <CardTitle>Your Uploaded Sample</CardTitle>
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
                  alt={`Water sample from ${selectedSample.location.name}`}
                  width={600}
                  height={400}
                  className="rounded-lg object-cover w-full aspect-video hover:scale-105 transition-transform duration-300"
                />
                {!isLoading && allBoundingBoxes.map((box, index) => (
                  <BoundingBox key={`${key}-${index}`} box={box} imageRef={uploadedImageRef} />
                ))}
              </>
            ) : (
              <div className="flex items-center justify-center w-full aspect-video bg-muted/50 rounded-lg border-2 border-dashed border-border">
                <div className="text-center">
                  <p className="text-lg font-semibold text-muted-foreground">No Sample Selected</p>
                  <p className="text-sm text-muted-foreground">Upload or choose a sample from the history.</p>
                </div>
              </div>
            )}
           </div>
        </CardContent>
      </Card>
      <div className="lg:col-span-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>AI-Powered Analysis & Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-muted/50">
                <TabsTrigger value="content">
                  <Microscope className="mr-2 h-4 w-4" /> Algae Content
                </TabsTrigger>
                <TabsTrigger value="implications">
                  <FileText className="mr-2 h-4 w-4" /> Implications
                </TabsTrigger>
                <TabsTrigger value="history">
                  <History className="mr-2 h-4 w-4" /> History Summary
                </TabsTrigger>
              </TabsList>
              <TabsContent value="content" className="mt-4">
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
                            <TableRow>
                              <TableHead className="font-semibold">Algae Type</TableHead>
                              <TableHead className="text-right font-semibold">Count</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(analysis?.algaeAnalysis.length ?? 0) > 0 ? (
                              analysis?.algaeAnalysis.map((algae) => (
                                <TableRow key={algae.name}>
                                  <TableCell className="font-medium">{algae.name}</TableCell>
                                  <TableCell className="text-right">
                                    <Badge variant={algae.count > 100 ? "destructive" : "secondary"} className="text-sm">
                                      {algae.count}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={2} className="text-center h-48 text-muted-foreground">
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
              <TabsContent value="implications" className="mt-4">
                 <Card className="border-0 shadow-none">
                  <CardContent className="p-6 min-h-[240px] bg-muted/30 rounded-md">
                    {isLoading || analysis?.explanation === 'Loading explanation...' ? (
                       <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                       </div>
                    ) : (
                      <p className="text-base text-foreground/80 leading-relaxed">
                        {analysis?.explanation || 'No implications to show. Analyze a sample first.'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
               <TabsContent value="history" className="mt-4">
                 <Card className="border-0 shadow-none">
                  <CardContent className="p-6 min-h-[240px] bg-muted/30 rounded-md">
                    {isLoading || analysis?.historySummary === 'Loading history...' ? (
                       <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                       </div>
                    ) : (
                      <p className="text-base text-foreground/80 leading-relaxed">
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
