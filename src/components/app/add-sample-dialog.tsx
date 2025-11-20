'use client';

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
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  locationName: z.string().min(3, {
    message: 'Location name must be at least 3 characters.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

type AddSampleDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormValues) => void;
  isRetest: boolean;
  sampleLocation?: string;
  isLoading: boolean;
};

export default function AddSampleDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  isRetest,
  sampleLocation,
  isLoading,
}: AddSampleDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      locationName: '',
    },
  });

  const handleFormSubmit: SubmitHandler<FormValues> = (data) => {
    onSubmit(data);
  };
  
  const handleRetestSubmit = () => {
    onSubmit({ locationName: sampleLocation || "Retest" });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isRetest ? 'Confirm Retest' : 'Add New Sample'}</DialogTitle>
          <DialogDescription>
            {isRetest
              ? `You are re-testing the sample from "${sampleLocation}". The new analysis will be added to its history.`
              : 'Please provide a location for the new water sample.'}
          </DialogDescription>
        </DialogHeader>

        {isRetest ? (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleRetestSubmit} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm & Analyze
            </Button>
          </DialogFooter>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="locationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sample Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Yamuna River, Delhi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Analyze Sample
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
