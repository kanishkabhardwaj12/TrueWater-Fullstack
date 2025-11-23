'use client';

import { Droplets } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function Header() {
  return (
    <>
      <header className="flex h-20 items-center gap-4 border-b bg-card/60 backdrop-blur-lg px-6 sticky top-0 z-30 shadow-sm">
        <SidebarTrigger className="md:hidden" />
        <div className="flex items-center gap-3">
            <Droplets className="h-9 w-9 text-primary animate-pulse" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground/90">
              TrueWater Algae Insights
            </h1>
        </div>
      </header>
    </>
  );
}
