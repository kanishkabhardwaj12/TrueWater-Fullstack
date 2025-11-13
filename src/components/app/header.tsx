'use client';

import { Droplets } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function Header() {
  return (
    <>
      <header className="sticky top-0 z-10 flex h-20 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-6">
        <SidebarTrigger className="md:hidden" />
        <div className="flex items-center gap-3">
            <Droplets className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground/90">
              TrueWater Algae Insights
            </h1>
        </div>
      </header>
    </>
  );
}
