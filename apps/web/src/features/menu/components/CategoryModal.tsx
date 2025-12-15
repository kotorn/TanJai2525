"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { createCategory } from "@/features/menu/actions";
import { toast } from "sonner";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantSlug: string;
  onSuccess: () => void;
}

export function CategoryModal({
  open,
  onOpenChange,
  tenantSlug,
  onSuccess,
}: CategoryModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: CategoryFormValues) => {
    try {
        const result = await createCategory(tenantSlug, data.name);
        
        if (result.success) {
            toast.success("Category created");
            reset();
            onSuccess();
            onOpenChange(false);
        } else {
            toast.error(result.error || "Error creating category");
        }
    } catch (error) {
        toast.error("An unexpected error occurred");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
          <DialogDescription>
            Create a new category to organize your menu items.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                placeholder="e.g. Desserts"
                {...register("name")}
                className={`col-span-3 ${errors.name ? "border-red-500" : ""}`}
              />
            </div>
            {errors.name && (
                <p className="text-xs text-red-500 text-right">{errors.name.message}</p>
            )}
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
                {isSubmitting ? "Creating..." : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
