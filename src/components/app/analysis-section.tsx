'use client';

import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Sample, AnalysisState } from '@/lib/types';
import { FileText, Microscope, History } from 'lucide-react';

type AnalysisSectionProps = {
  selectedSample: Sample | null;
  analysis: AnalysisState | null;
  isLoading: boolean;
};

export default function AnalysisSection({
  selectedSample,
  analysis,
  isLoading,
}: AnalysisSectionProps) {
  const cleanWaterImage = PlaceHolderImages.find(
    (img) => img.id === 'clean-water'
  );

  const totalCount = analysis?.algaeAnalysis?.reduce(
    (sum, algae) => sum + algae.count,
    0
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <div className="lg:col-span-4">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Sample Comparison</CardTitle>
            <CardDescription>
              Your uploaded sample vs. a clean reference sample.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="flex flex-col gap-2">
                <h3 className="font-semibold text-sm">Reference: Clean Sample</h3>
                 {cleanWaterImage ? (
                  <Image
                    src={cleanWaterImage.imageUrl}
                    alt={cleanWaterImage.description}
                    width={600}
                    height={400}
                    className="rounded-lg object-cover w-full aspect-video"
                    data-ai-hint={cleanWaterImage.imageHint}
                    priority
                  />
                ) : (
                  <Skeleton className="w-full aspect-video rounded-lg" />
                )}
             </div>
             <div className="flex flex-col gap-2">
                <h3 className="font-semibold text-sm">Your Uploaded Sample</h3>
                {isLoading && !selectedSample?.imageUrl.startsWith('data:') ? (
                  <Skeleton className="w-full aspect-video rounded-lg" />
                ) : selectedSample ? (
                  <Image
                    src={selectedSample.imageUrl}
                    alt={`Water sample from ${selectedSample.location.name}`}
                    width={600}
                    height={400}
                    className="rounded-lg object-cover w-full aspect-video"
                    data-ai-hint={selectedSample.imageHint}
                  />
                ) : (
                  <div className="flex items-center justify-center w-full aspect-video bg-muted/50 rounded-lg">
                    <div className="text-center p-4">
                      <p className="text-sm font-semibold text-muted-foreground">
                        No Sample Selected
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Upload or choose a sample from the history.
                      </p>
                    </div>
                  </div>
                )}
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-3">
         <Card className="h-full">
            <CardHeader>
              <CardTitle>AI-Powered Analysis</CardTitle>
               <CardDescription>
                Insights generated from the sample analysis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-muted/80">
                  <TabsTrigger value="content">
                    <Microscope className="mr-2 h-4 w-4" /> Content
                  </TabsTrigger>
                  <TabsTrigger value="implications">
                    <FileText className="mr-2 h-4 w-4" /> Implications
                  </TabsTrigger>
                  <TabsTrigger value="history">
                    <History className="mr-2 h-4 w-4" /> History
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="content" className="mt-4">
                  <Card className="border-0 shadow-none">
                    <CardHeader>
                      <CardTitle className="text-lg">Algae Content</CardTitle>
                      <CardDescription>
                        Total Count:
                        {isLoading ? <Skeleton className="h-4 w-10 inline-block ml-2"/> : 
                        <Badge variant="secondary" className="ml-2">{totalCount}</Badge>
                        }
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      {isLoading ? (
                        <div className="space-y-2 px-6 pb-6">
                           <Skeleton className="h-8 w-full" />
                           <Skeleton className="h-8 w-full" />
                        </div>
                      ) : (
                        <ScrollArea className="h-48">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Algae Type</TableHead>
                                <TableHead className="text-right">Count</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {(analysis?.algaeAnalysis.length ?? 0) > 0 ? (
                                analysis?.algaeAnalysis.map((algae) => (
                                  <TableRow key={algae.name}>
                                    <TableCell className="font-medium capitalize">{algae.name.replace(/_/g, ' ')}</TableCell>
                                    <TableCell className="text-right">
                                      <Badge variant={algae.count > 100 ? 'destructive' : 'outline'}>
                                        {algae.count}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={2} className="text-center h-36">
                                    No algae content detected.
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="implications" className="mt-4">
                  <Card className="border-0 shadow-none">
                     <CardHeader>
                        <CardTitle className="text-lg">Implications</CardTitle>
                     </CardHeader>
                    <CardContent className="min-h-[14.5rem]">
                      {isLoading ? (
                         <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                         </div>
                      ) : (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {analysis?.explanation || 'No implications to show. Analyze a sample first.'}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                 <TabsContent value="history" className="mt-4">
                   <Card className="border-0 shadow-none">
                      <CardHeader>
                        <CardTitle className="text-lg">History Summary</CardTitle>
                      </CardHeader>
                    <CardContent className="min-h-[14.5rem]">
                      {isLoading && !analysis?.historySummary ? (
                         <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                         </div>
                      ) : (
                        <p className="text-sm text-muted-foreground leading-relaxed">
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
