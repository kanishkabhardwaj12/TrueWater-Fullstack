'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Sample } from '@/lib/types';
import { format } from 'date-fns';
import {
  ChevronLeft,
  FileText,
  History,
  Home,
  LineChart,
  Loader2,
  Package,
  Package2,
  PanelLeft,
  PlusCircle,
  Search,
  Settings,
  ShoppingCart,
  Upload,
  Users2,
} from 'lucide-react';

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
      event.target.value = ''; // Reset file input
    }
  };
  const isMobile = useIsMobile();

  const uniqueTestIds = new Set<string>();
  const uniqueSamples = samples.filter((sample) => {
    if (uniqueTestIds.has(sample.testId)) {
      return false;
    }
    uniqueTestIds.add(sample.testId);
    return true;
  });

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
          <AccordionItem value="item-1" className="border-b-0">
            <AccordionTrigger className="text-base font-semibold hover:no-underline">
              Upload Sample
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2">
                <Input
                  id="upload-sample-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                  disabled={isLoading}
                >
                  <Label
                    htmlFor="upload-sample-input"
                    className={`cursor-pointer ${isLoading ? 'cursor-not-allowed' : ''}`}
                  >
                    {isLoading && selectedSample?.id.startsWith('TEMP-') ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    Choose Image
                  </Label>
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <h3 className="text-sm font-semibold text-muted-foreground mb-2">
          Sample History
        </h3>
        <nav className="grid items-start gap-1">
          {isLoading && samples.length === 0 ? (
            <>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </>
          ) : uniqueSamples.length > 0 ? (
            uniqueSamples.map((sample) => (
              <Button
                key={sample.id}
                variant={selectedSample?.testId === sample.testId ? 'secondary' : 'ghost'}
                className="w-full h-auto py-2 flex-col items-start"
                onClick={() => onSelectSample(sample)}
              >
                <div className="font-semibold text-left">
                  {sample.location?.name?.split(',')[0] || 'Processing...'}
                </div>
                <div className="text-xs text-muted-foreground text-left">
                  ID: {sample.testId.substring(0, 8)}...
                </div>
                <div className="text-xs text-muted-foreground text-left">
                  {sample.dateOfTest ? `Date: ${format(
                      typeof sample.dateOfTest === 'string'
                        ? new Date(sample.dateOfTest)
                        : sample.dateOfTest.toDate(),
                      'PP'
                    )}`
                  : 'Date: N/A'}
                </div>
              </Button>
            ))
          ) : (
            <div className="text-center text-sm text-muted-foreground py-10">
              No samples found.
            </div>
          )}
        </nav>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs p-0">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-card sm:flex">
      {sidebarContent}
    </aside>
  );
}
