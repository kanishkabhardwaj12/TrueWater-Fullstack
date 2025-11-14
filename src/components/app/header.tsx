'use client';

import { Droplets, PanelLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import HistorySidebar from './history-sidebar';
import { useState } from 'react';
import { Sample } from '@/lib/types';
import { useSidebar } from '../ui/sidebar';

export default function Header() {
  const { toggleSidebar } = useSidebar();
  
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <Button size="icon" variant="outline" className="md:hidden" onClick={toggleSidebar}>
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      <div className="flex items-center gap-3">
        <Droplets className="h-7 w-7 text-primary" />
        <h1 className="text-xl font-bold tracking-tight text-foreground/90">
          TrueWater Algae Insights
        </h1>
      </div>
    </header>
  );
}
