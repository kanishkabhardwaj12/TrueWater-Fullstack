'use client';

import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenuSkeleton,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, Microscope } from 'lucide-react';
import type { Sample } from '@/lib/types';
import { format } from 'date-fns';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

type DisplaySample = Sample & { location: any; imageUrl: string };

type HistorySidebarProps = {
  samples: DisplaySample[];
  selectedSample: DisplaySample | null;
  onSelectSample: (sample: DisplaySample) => void;
  onImageUpload: (file: File) => void;
  isLoading: boolean;
};

export default function HistorySidebar({
  samples,
  selectedSample,
  onSelectSample,
  onImageUpload,
  isLoading,
}: HistorySidebarProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const uniqueSamples = Array.from(
    new Map(samples.map((s) => [s.testId, s])).values()
  ).sort((a, b) => {
    const dateA = a.dateOfTest ? a.dateOfTest.toDate().getTime() : 0;
    const dateB = b.dateOfTest ? b.dateOfTest.toDate().getTime() : 0;
    return dateB - dateA;
  });

  return (
    <>
      <SidebarHeader className="border-b border-sidebar-border p-0">
        <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
          <AccordionItem value="item-1" className="border-none">
            <AccordionTrigger className="p-4 text-xl font-semibold text-sidebar-foreground hover:no-underline">
              Upload Sample
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="upload-sample-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isLoading}
                  />
                  <Button asChild variant="outline" className="w-full bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80">
                    <Label htmlFor="upload-sample-input" className="cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" /> Choose Image
                    </Label>
                  </Button>
                  {isLoading && selectedSample?.id.startsWith('NEW-') && (
                    <Button disabled variant="outline" size="icon" className="bg-sidebar-accent">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </Button>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="pt-0">
          <SidebarGroupLabel className="text-base font-semibold text-sidebar-foreground/80">Sample History</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading && samples.length === 0 ? (
                <>
                  <SidebarMenuSkeleton showIcon />
                  <SidebarMenuSkeleton showIcon />
                  <SidebarMenuSkeleton showIcon />
                </>
              ) : (
                uniqueSamples.map((sample) => (
                  <SidebarMenuItem key={sample.testId}>
                    <SidebarMenuButton
                      onClick={() => onSelectSample(sample)}
                      isActive={selectedSample?.testId === sample.testId}
                      className="w-full h-auto py-3"
                      size="lg"
                    >
                      <Microscope />
                      <div className="flex flex-col items-start gap-0.5">
                        <span className="font-semibold text-base">
                          {sample.location ? sample.location.name.split(',')[0] : 'Processing...'}
                        </span>
                        <span className="text-xs text-sidebar-foreground/60">
                          ID: {sample.testId.substring(0, 8)}...
                        </span>
                        {sample.dateOfTest && (
                          <span className="text-xs text-sidebar-foreground/60">
                            Last test:{' '}
                            {format(
                              sample.dateOfTest.toDate(),
                              'PP'
                            )}
                          </span>
                        )}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}
