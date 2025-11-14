'use client';

import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
} from '@vis.gl/react-google-maps';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Sample } from '@/lib/types';
import { useEffect, useState, useMemo } from 'react';

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
    if (selectedSample) {
      setCenter({ 
        lat: selectedSample.sourceWaterLocationLatitude, 
        lng: selectedSample.sourceWaterLocationLongitude 
      });
    }
  }, [selectedSample]);

  const uniqueSamplesByLocation = useMemo(() => {
    const map = new Map<string, Sample>();
    for (const sample of samples) {
      // Create a unique key for each location
      const locationKey = `${sample.sourceWaterLocationLatitude},${sample.sourceWaterLocationLongitude}`;
      if (!map.has(locationKey)) {
        map.set(locationKey, sample);
      }
    }
    return Array.from(map.values());
  }, [samples]);

  if (!apiKey) {
    return (
      <Card>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Sample Map</CardTitle>
        <CardDescription>Real-time locations of water sample analyses.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] w-full rounded-lg overflow-hidden border">
          <APIProvider apiKey={apiKey}>
            <GoogleMap
              center={center}
              zoom={10}
              mapId="truewater-map"
              gestureHandling={'greedy'}
              disableDefaultUI={true}
              mapTypeControl={false}
            >
              {uniqueSamplesByLocation.map((sample) => (
                <AdvancedMarker 
                  key={sample.id} 
                  position={{ lat: sample.sourceWaterLocationLatitude, lng: sample.sourceWaterLocationLongitude }}
                >
                   <Pin 
                    background={'hsl(var(--primary))'}
                    borderColor={'hsl(var(--primary-foreground))'}
                    glyphColor={'hsl(var(--primary-foreground))'}
                    scale={selectedSample?.testId === sample.testId ? 1.5 : 1}
                   />
                </AdvancedMarker>
              ))}
            </GoogleMap>
          </APIProvider>
        </div>
      </CardContent>
    </Card>
  );
}
