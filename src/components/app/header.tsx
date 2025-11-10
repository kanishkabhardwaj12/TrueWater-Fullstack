'use client';

import { Droplets } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';

export default function Header() {
  return (
    <>
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
        <SidebarTrigger className="md:hidden" />
        <div className="flex items-center gap-2">
            <Droplets className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold tracking-tight">
              TrueWater Algae Insights
            </h1>
        </div>
      </header>
    </>
  );
}
