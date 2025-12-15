'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Database } from '@/lib/database.types';
import { useEffect } from 'react';

type Category = Database['public']['Tables']['menu_categories']['Row'];

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sort_order: z.number().int().default(0),
});

interface CategoryFormProps {
  initialData?: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: z.infer<typeof formSchema>) => Promise<void>;
  isSubmitting?: boolean;
}

export function CategoryForm({
  initialData,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: CategoryFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      sort_order: 0,
    },
  });

  useEffect(() => {
    if (isOpen) {
        if (initialData) {
            form.reset({
                name: initialData.name,
                sort_order: initialData.sort_order,
            });
        } else {
            form.reset({
                name: '',
                sort_order: 0,
            });
        }
    }
  }, [isOpen, initialData, form]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    await onSubmit(values);
    // Ideally close dialog after success, or handled by parent
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Category' : 'New Category'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Category Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sort_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort Order</FormLabel>
                  <FormControl>
                    <Input 
                        type="number" 
                        {...field} 
                        onChange={e => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
