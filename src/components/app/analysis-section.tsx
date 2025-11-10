'use client';

import Image from 'next/image';
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Clean Sample</CardTitle>
        </CardHeader>
        <CardContent>
          {cleanWaterImage && (
            <Image
              src={cleanWaterImage.imageUrl}
              alt={cleanWaterImage.description}
              width={600}
              height={400}
              className="rounded-lg object-cover w-full aspect-video"
              data-ai-hint={cleanWaterImage.imageHint}
            />
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Your Sample</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && !selectedSample ? (
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
            <div className="flex items-center justify-center w-full aspect-video bg-muted rounded-lg">
              <p className="text-muted-foreground">Upload a sample to see it here</p>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Analysis & Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="content">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content">
                  <Microscope /> Algae Content
                </TabsTrigger>
                <TabsTrigger value="implications">
                  <FileText /> Implications
                </TabsTrigger>
                <TabsTrigger value="history">
                  <History /> History Summary
                </TabsTrigger>
              </TabsList>
              <TabsContent value="content">
                <Card>
                  <CardContent className="p-6">
                    {isLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-20 w-full" />
                      </div>
                    ) : (
                      <ScrollArea className="h-60">
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
                                  <TableCell className="font-medium">{algae.name}</TableCell>
                                  <TableCell className="text-right">
                                    <Badge variant={algae.count > 100 ? "destructive" : "secondary"}>
                                      {algae.count}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={2} className="text-center h-24">
                                  No algae content detected or sample not analyzed.
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
              <TabsContent value="implications">
                 <Card>
                  <CardContent className="p-6">
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
               <TabsContent value="history">
                 <Card>
                  <CardContent className="p-6">
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
