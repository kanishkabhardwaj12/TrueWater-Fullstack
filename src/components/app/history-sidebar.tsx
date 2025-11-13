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

type HistorySidebarProps = {
  samples: Sample[];
  selectedSample: Sample | null;
  onSelectSample: (sample: Sample) => void;
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

  const uniqueSamples = Array.from(new Map(samples.map(s => [s.testID, s])).values());

  return (
    <>
      <SidebarHeader>
        <Accordion type="single" collapsible defaultValue="upload" className="w-full">
            <AccordionItem value="upload" className="border-b-0">
                <AccordionTrigger>
                  <Label>Upload New Sample</Label>
                </AccordionTrigger>
                <AccordionContent>
                <div className="space-y-2 pt-2">
                    <div className="flex gap-2">
                        <Input id="upload-sample-input" type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isLoading} />
                        <Button asChild variant="outline" className="w-full">
                            <Label htmlFor="upload-sample-input" className="cursor-pointer">
                                <Upload className="mr-2 h-4 w-4" /> Choose Image
                            </Label>
                        </Button>
                        {isLoading && selectedSample?.testID.startsWith('NEW-') && <Button disabled variant="outline" size="icon"><Loader2 className="h-4 w-4 animate-spin" /></Button>}
                    </div>
                </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
      </SidebarHeader>
      <SidebarContent>
          <SidebarGroup className="pt-0">
              <SidebarGroupLabel>Sample History</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {uniqueSamples.map((sample) => (
                    <SidebarMenuItem key={sample.testID}>
                      <SidebarMenuButton
                          onClick={() => onSelectSample(sample)}
                          isActive={selectedSample?.testID === sample.testID}
                          className="w-full h-auto py-2"
                          size="lg"
                      >
                          <Microscope />
                          <div className="flex flex-col items-start">
                              <span className="font-medium">{sample.location.name.split(',')[0]}</span>
                              <span className="text-xs text-muted-foreground">ID: {sample.testID}</span>
                              <span className="text-xs text-muted-foreground">Last test: {format(new Date(sample.date), 'PP')}</span>
                          </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
          </SidebarGroup>
      </SidebarContent>
    </>
  );
}
