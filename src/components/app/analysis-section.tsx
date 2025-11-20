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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Sample, AnalysisState } from '@/lib/types';
import { FileText, Microscope, History, TestTube } from 'lucide-react';
import React from 'react';

type AnalysisSectionProps = {
  selectedSample: Sample | null;
  analysis: AnalysisState | null;
  isLoading: boolean;
  onImageUpload: (file: File, isRetest: boolean) => void;
};

export default function AnalysisSection({
  selectedSample,
  analysis,
  isLoading,
  onImageUpload,
}: AnalysisSectionProps) {
  const cleanWaterImage = PlaceHolderImages.find(
    (img) => img.id === 'clean-water'
  );

  const totalCount = analysis?.algaeAnalysis?.reduce(
    (sum, algae) => sum + algae.count,
    0
  );

  const retestInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file, true);
      if(event.target) event.target.value = ''; 
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Sample Comparison</CardTitle>
            <CardDescription>
              Your uploaded sample vs. a clean reference sample.
            </CardDescription>
          </div>
          {selectedSample && !selectedSample.id.startsWith('TEMP-') && (
             <div>
               <Input
                  id="retest-sample-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isLoading}
                  ref={retestInputRef}
                />
              <Button asChild variant="outline">
                <Label htmlFor="retest-sample-input" className="cursor-pointer">
                  <TestTube className="mr-2 h-4 w-4" />
                  Retest Sample
                </Label>
              </Button>
            </div>
          )}
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
            {isLoading && !selectedSample?.sampleImageUrl.startsWith('data:') ? (
              <Skeleton className="w-full aspect-video rounded-lg" />
            ) : selectedSample ? (
              <Image
                src={selectedSample.sampleImageUrl}
                alt={`Water sample from ${selectedSample.locationName}`}
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

      <Card>
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
                    {isLoading ? (
                      <Skeleton className="h-4 w-10 inline-block ml-2" />
                    ) : (
                      <Badge variant="secondary" className="ml-2">
                        {totalCount ?? 0}
                      </Badge>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="space-y-2 px-6 pb-6">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ) : (
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
                              <TableCell className="font-medium capitalize">
                                {algae.name.replace(/_/g, ' ')}
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge
                                  variant={
                                    algae.count > 100
                                      ? 'destructive'
                                      : 'outline'
                                  }
                                >
                                  {algae.count}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={2}
                              className="text-center h-24"
                            >
                              No algae content detected.
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
                      {analysis?.explanation ||
                        'No implications to show. Analyze a sample first.'}
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
                      {analysis?.historySummary ||
                        'No history summary available. Select a sample with multiple tests.'}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
