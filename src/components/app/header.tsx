'use client';

import { Droplets, PanelLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { useSidebar } from '../ui/sidebar';

export default function Header() {
  const { toggleSidebar } = useSidebar();
  
  return (
    <header className="flex h-14 items-center gap-4 bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-0 mb-4">
        <Button size="icon" variant="outline" className="md:hidden" onClick={toggleSidebar}>
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      <div className="flex items-center gap-3">
        <Droplets className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground/90">
          TrueWater Algae Insights
        </h1>
      </div>
    </header>
  );
}
