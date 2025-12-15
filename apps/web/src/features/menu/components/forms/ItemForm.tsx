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
} from "@tanjai/ui";
import { Button } from "@tanjai/ui";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@tanjai/ui";
import { Input } from "@tanjai/ui";
import { Textarea } from "@tanjai/ui";
import { Checkbox } from "@tanjai/ui";
import { Database } from '@/lib/database.types';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@tanjai/ui";

type MenuItem = Database['public']['Tables']['menu_items']['Row'];
type Category = Database['public']['Tables']['menu_categories']['Row'];

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  category_id: z.string().optional(), // Can be null/optional in DB, likely required in UI for UX
  is_available: z.boolean().default(true),
  image_url: z.string().optional(),
});

interface ItemFormProps {
  initialData?: MenuItem | null;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: z.infer<typeof formSchema> & { imageFile?: File }) => Promise<void>;
  isSubmitting?: boolean;
}

export function ItemForm({
  initialData,
  categories,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: ItemFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category_id: undefined,
      is_available: true,
      image_url: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
        setImageFile(null); // Reset file input
        if (initialData) {
            form.reset({
                name: initialData.name,
                description: initialData.description || '',
                price: initialData.price,
                category_id: initialData.category_id || undefined,
                is_available: initialData.is_available ?? true,
                image_url: initialData.image_url || '',
            });
        } else {
            form.reset({
                name: '',
                description: '',
                price: 0,
                is_available: true,
                category_id: undefined,
                image_url: '',
            });
        }
    }
  }, [isOpen, initialData, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setImageFile(e.target.files[0]);
      }
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    await onSubmit({ ...values, imageFile: imageFile || undefined });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Item' : 'New Item'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                        <Input placeholder="Item Name" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                         <Input 
                            type="number" 
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            
             <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Item description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
             <div className="grid grid-cols-2 gap-4">
                <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                        <Input type="file" accept="image/*" onChange={handleFileChange} />
                    </FormControl>
                    <FormDescription>Upload a new image to replace current one.</FormDescription>
                </FormItem>

                <FormField
                control={form.control}
                name="is_available"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                        <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                        <FormLabel>
                        Available
                        </FormLabel>
                        <FormDescription>
                        Show this item on the menu
                        </FormDescription>
                    </div>
                    </FormItem>
                )}
                />
            </div>

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
