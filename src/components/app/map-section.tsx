'use client';

import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
} from '@vis.gl/react-google-maps';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Sample } from '@/lib/types';

type MapSectionProps = {
  samples: Sample[];
  selectedSample: Sample | null;
};

export default function MapSection({
  samples,
  selectedSample,
}: MapSectionProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Sample Locations</CardTitle>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center">
          <p className="text-muted-foreground">
            Google Maps API key is missing. Please add it to your .env.local file.
          </p>
        </CardContent>
      </Card>
    );
  }

  const uniqueLocations = Array.from(new Map(samples.map(s => [s.location.name, s.location])).values());
  const center = selectedSample?.location || { lat: 28.7041, lng: 77.1025 };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Sample Locations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] w-full rounded-lg overflow-hidden">
          <APIProvider apiKey={apiKey}>
            <Map
              center={center}
              zoom={11}
              mapId="truewater-map"
              gestureHandling={'greedy'}
              disableDefaultUI={true}
            >
              {uniqueLocations.map((location) => (
                <AdvancedMarker key={location.name} position={location}>
                   <Pin 
                    background={'hsl(var(--primary))'}
                    borderColor={'hsl(var(--card))'}
                    glyphColor={'hsl(var(--card))'}
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
