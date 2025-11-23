'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import type { Sample } from '@/lib/types';

interface AddSampleDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: {
    file: File;
    locationName: string;
    latitude: number;
    longitude: number;
    isRetest: boolean;
  }) => void;
  isRetest: boolean;
  file: File | null;
  isLoading: boolean;
  selectedSample: Sample | null;
}

export function AddSampleDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  isRetest,
  file,
  isLoading,
  selectedSample,
}: AddSampleDialogProps) {
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState(28.7041); // Default to Delhi
  const [longitude, setLongitude] = useState(77.1025);

  useEffect(() => {
    if (isOpen) {
        if (isRetest && selectedSample) {
            setLocationName(selectedSample.locationName || '');
            setLatitude(selectedSample.sourceWaterLocationLatitude);
            setLongitude(selectedSample.sourceWaterLocationLongitude);
        } else {
            // Reset for new sample
            setLocationName('');
            setLatitude(28.7041);
            setLongitude(77.1025);
        }
    }
  }, [isOpen, isRetest, selectedSample]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      onSubmit({ file, locationName, latitude, longitude, isRetest });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isRetest ? 'Retest Sample' : 'Add New Sample'}</DialogTitle>
            <DialogDescription>
              {isRetest
                ? 'Upload a new image for this sample location. The location details are pre-filled.'
                : 'Provide the location details for your new water sample.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="locationName" className="text-right">
                Location
              </Label>
              <Input
                id="locationName"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Hauz Khas Lake"
                required
                disabled={isRetest}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="latitude" className="text-right">
                Latitude
              </Label>
              <Input
                id="latitude"
                type="number"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value))}
                className="col-span-3"
                required
                disabled={isRetest}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="longitude" className="text-right">
                Longitude
              </Label>
              <Input
                id="longitude"
                type="number"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value))}
                className="col-span-3"
                required
                disabled={isRetest}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !file}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                isRetest ? 'Retest Sample' : 'Analyze and Save'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
