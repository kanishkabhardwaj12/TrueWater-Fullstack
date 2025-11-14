'use client';

import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
} from '@vis.gl/react-google-maps';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Sample } from '@/lib/types';
import { useEffect, useState } from 'react';

type MapSectionProps = {
  samples: Sample[];
  selectedSample: Sample | null;
};

export default function MapSection({
  samples,
  selectedSample,
}: MapSectionProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [center, setCenter] = useState({ lat: 28.7041, lng: 77.1025 });

  useEffect(() => {
    if (selectedSample?.location) {
      setCenter(selectedSample.location);
    }
  }, [selectedSample]);

  if (!apiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sample Locations</CardTitle>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center">
          <p className="text-muted-foreground">
            Google Maps API key is missing.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const uniqueLocations = Array.from(
    new Map(
      samples
        .filter(s => s.location && typeof s.location.lat === 'number' && typeof s.location.lng === 'number')
        .map(s => [s.location.name, s.location])
    ).values()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Sample Map</CardTitle>
        <CardDescription>Real-time locations of water sample analyses.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] w-full rounded-lg overflow-hidden border">
          <APIProvider apiKey={apiKey}>
            <Map
              center={center}
              zoom={10}
              mapId="truewater-map"
              gestureHandling={'greedy'}
              disableDefaultUI={true}
              mapTypeControl={false}
            >
              {uniqueLocations.map((location) => (
                <AdvancedMarker key={location.name} position={location}>
                   <Pin 
                    background={'hsl(var(--primary))'}
                    borderColor={'hsl(var(--primary-foreground))'}
                    glyphColor={'hsl(var(--primary-foreground))'}
                    scale={selectedSample?.location.name === location.name ? 1.5 : 1}
                   />
                </AdvancedMarker>
              ))}
            </Map>
          </APIProvider>
        </div>
      </CardContent>
    </Card>
  );
}
