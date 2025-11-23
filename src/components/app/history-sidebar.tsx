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
import { Loader2, Upload, Microscope, RefreshCw } from 'lucide-react';
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
  onRetest: (file: File) => void;
  isLoading: boolean;
};

export default function HistorySidebar({
  samples,
  selectedSample,
  onSelectSample,
  onImageUpload,
  onRetest,
  isLoading,
}: HistorySidebarProps) {
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, isRetest: boolean) => {
    const file = event.target.files?.[0];
    if (file) {
      if (isRetest) {
        onRetest(file);
      } else {
        onImageUpload(file);
      }
      // Reset file input to allow re-uploading the same file
      event.target.value = '';
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
              Actions
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="upload-new-input" className='text-sm font-medium text-sidebar-foreground/80'>New Sample</Label>
                <Input
                  id="upload-new-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, false)}
                  disabled={isLoading}
                />
                <Button asChild variant="outline" className="w-full bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80" disabled={isLoading}>
                  <Label htmlFor="upload-new-input" className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" /> Upload Image
                  </Label>
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="retest-input" className='text-sm font-medium text-sidebar-foreground/80'>Retest Selected Sample</Label>
                <Input
                  id="retest-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, true)}
                  disabled={isLoading || !selectedSample}
                />
                <Button asChild variant="outline" className="w-full bg-sidebar-accent/70 text-sidebar-accent-foreground hover:bg-sidebar-accent/60" disabled={isLoading || !selectedSample}>
                   <Label htmlFor="retest-input" className={`cursor-pointer ${!selectedSample || isLoading ? 'cursor-not-allowed' : ''}`}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Retest with Image
                  </Label>
                </Button>
              </div>

              {isLoading && selectedSample?.id.startsWith('TEMP-') && (
                <div className="flex items-center justify-center text-sidebar-foreground/80">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Analyzing...</span>
                </div>
              )}
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
                          {sample.locationName || sample.testId.substring(0,12)}
                        </span>
                        <span className="text-xs text-sidebar-foreground/60">
                          ID: {sample.testId.substring(0, 8)}...
                        </span>
                        {sample.dateOfTest && (
                          <span className="text-xs text-sidebar-foreground/60">
                            Last test:{' '}
                            {format(
                              sample.dateOfTest.toDate ? sample.dateOfTest.toDate() : new Date(sample.dateOfTest as any),
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
