"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@tanjai/ui";
import { Button } from "@tanjai/ui";
import { Input } from "@tanjai/ui";
import { Label } from "@tanjai/ui";
import { Textarea } from "@tanjai/ui";
import { createMenuItem, updateMenuItem, Category, MenuItem } from "@/features/menu/actions";
import { toast } from "sonner";
import { useState, useEffect } from "react";
// import { uploadRestaurantAsset } from "@/lib/supabase/storage"; // No supabase storage in web mock? 
// We will skip actual upload and just use a placeholder text or data URI for now.

const menuItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.coerce.number().min(0, "Price must be positive"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  is_available: z.boolean().default(true),
});

type MenuItemFormValues = z.infer<typeof menuItemSchema>;

interface MenuItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantSlug: string;
  categories: Category[]; // We might not need strict categories from DB if we allow string input
  onSuccess: () => void;
  itemToEdit?: MenuItem | null; // If provided, mode is 'edit'
}

export function MenuItemModal({
  open,
  onOpenChange,
  tenantSlug,
  categories,
  onSuccess,
  itemToEdit
}: MenuItemModalProps) {
  const isEditMode = !!itemToEdit;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      category: "",
      price: 0,
      description: "",
      name: "",
      is_available: true,
    },
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Initialize form when opening/editing
  useEffect(() => {
    if (open) {
        if (isEditMode && itemToEdit) {
            setValue("name", itemToEdit.name);
            setValue("price", itemToEdit.price);
            setValue("category", itemToEdit.category || "");
            setValue("description", itemToEdit.description || "");
            setValue("is_available", itemToEdit.is_available);
            setImagePreview(itemToEdit.image_url);
        } else {
            reset({
                category: categories.length > 0 ? categories[0].name : "Main",
                price: 0,
                description: "",
                name: "",
                is_available: true
            });
            setImagePreview(null);
        }
        setImageFile(null);
    }
  }, [open, isEditMode, itemToEdit, categories, reset, setValue]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: MenuItemFormValues) => {
    try {
        let imageUrl = itemToEdit?.image_url || null;
        
        if (imageFile && imagePreview) {
             // Mock upload by using the data URI if small enough, or just placeholder
             // For a real app we need an upload endpoint. 
             // modifying to just use the data URI for demo purposes creates a large payload but works for local.
             imageUrl = imagePreview; 
        }

        const payload = {
            ...data,
            image_url: imageUrl,
        };

        let result;
        if (isEditMode && itemToEdit) {
            result = await updateMenuItem(itemToEdit.id, payload);
        } else {
            result = await createMenuItem(tenantSlug, payload);
        }

        if (result.success) {
            toast.success(isEditMode ? "Item updated" : "Item created");
            onSuccess();
            onOpenChange(false);
        } else {
            toast.error(result.error || "Error saving item");
        }
    } catch (error) {
        console.error(error);
        toast.error("An unexpected error occurred");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update item details" : "Create a new menu item"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-6 py-4">
            
            {/* Image Upload Area */}
            <div className="flex justify-center">
               <label className="w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 transition-colors overflow-hidden relative bg-gray-50">
                  {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                      <>
                        <div className="p-4 bg-orange-100 rounded-full mb-3 text-orange-600">
                          <Upload className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Upload Photo</span>
                        <span className="text-xs text-gray-400 mt-1">PNG, JPG</span>
                      </>
                  )}
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageSelect}
                  />
               </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Pad Thai"
                  {...register("name")}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="price">Price (THB) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0"
                  {...register("price")}
                  className={errors.price ? "border-red-500" : ""}
                />
                {errors.price && (
                  <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                {/* Simplified to text input or select with basic options if categories are dynamic */}
                <select
                  id="category"
                  {...register("category")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select Category...</option>
                  {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                  {/* Fallback options if empty */}
                  {!categories.length && (
                      <>
                        <option value="Main">Main</option>
                        <option value="Appetizer">Appetizer</option>
                        <option value="Drink">Drink</option>
                      </>
                  )}
                </select>
                {errors.category && (
                  <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>
                )}
              </div>

              <div className="col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Ingredients, taste..."
                  {...register("description")}
                  rows={3}
                />
              </div>

               <div className="col-span-2 flex items-center space-x-2 pt-2">
                 <input 
                    type="checkbox"
                    id="is_available"
                    {...register("is_available")}
                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500 border-gray-300"
                 />
                 <Label htmlFor="is_available">Available for sale</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700 text-white">
              {isSubmitting ? "Saving..." : (isEditMode ? "Update Item" : "Create Item")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
