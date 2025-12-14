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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createMenuItem, Category } from "@/features/menu/actions";
import { toast } from "sonner";
import { useState, useEffect } from "react";

const menuItemSchema = z.object({
  name: z.string().min(1, "กรุณาระบุชื่อรายการ"),
  price: z.coerce.number().min(0, "ราคาต้องไม่ต่ำกว่า 0"),
  categoryId: z.string().min(1, "กรุณาเลือกหมวดหมู่"),
  description: z.string().optional(),
});

interface CreateMenuItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCategoryId?: string | null;
  categories: Category[];
  onSuccess: () => void;
}

export function CreateMenuItemModal({
  open,
  onOpenChange,
  defaultCategoryId,
  categories,
  onSuccess
}: CreateMenuItemModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      categoryId: defaultCategoryId || "",
      price: 0,
      description: "",
      name: "",
    },
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Update category when default changes
  useEffect(() => {
    if (defaultCategoryId) {
        setValue("categoryId", defaultCategoryId);
    }
  }, [defaultCategoryId, setValue]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Optional: Upload immediately or wait for submit. 
      // Uploading immediately to get URL
      setIsUploading(true);
      try {
         // Using the shared storage utility
         // Import this at the top: import { uploadRestaurantAsset } from "@/lib/supabase/storage";
         // We'll need to add the import in a separate edit or assume it's there? 
         // I'll add the import in the next step to be safe, or I can try to add it now if I replace the whole file or top chunk.
         // For now, I'll simulate the upload call here and I'll confirm the import exists or add it.
         // Actually, let's just write the logic here and I'll ensure the import is added.
      } catch (error) {
         console.error("Error previewing image", error);
      } finally {
         setIsUploading(false);
      }
    }
  };

  const onSubmit = async (data: any) => {
    try {
        let imageUrl = null;
        
        if (imageFile) {
            // Upload if we have a file
            // Note: If we uploaded on select, we'd use that URL. 
            // Let's do upload on submit to keep it simple and clean if they cancel.
            const { uploadRestaurantAsset } = await import("@/lib/supabase/storage");
            imageUrl = await uploadRestaurantAsset(imageFile, "restaurant-assets");
        }

        const payload = {
            ...data,
            image_url: imageUrl,
        };

        const result = await createMenuItem(payload);
        if (result.success) {
            toast.success("บันทึกรายการอาหารสำเร็จ");
            reset();
            setImageFile(null);
            setImagePreview(null);
            onSuccess();
            onOpenChange(false);
        } else {
            toast.error(result.error || "เกิดข้อผิดพลาด");
        }
    } catch (error) {
        console.error(error);
        toast.error("เกิดข้อผิดพลาดในการอัพโหลดหรือบันทึก");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>เพิ่มรายการอาหาร</DialogTitle>
          <DialogDescription>
            สร้างรายการอาหารใหม่ กรุณาระบุรายละเอียดให้ครบถ้วน
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-6 py-4">
            
            {/* Image Upload Area */}
            <div className="flex justify-center">
               <label className="w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 transition-colors overflow-hidden relative">
                  {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                      <>
                        <div className="p-4 bg-orange-100 rounded-full mb-3 text-orange-600">
                          <Upload className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">อัพโหลดรูปภาพอาหาร</span>
                        <span className="text-xs text-gray-400 mt-1">PNG, JPG (แนะนำ 4:3)</span>
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
                <Label htmlFor="name">ชื่อรายการ *</Label>
                <Input
                  id="name"
                  placeholder="เช่น ข้าวกะเพราหมูสับ"
                  {...register("name")}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name.message as string}</p>
                )}
              </div>

              <div>
                <Label htmlFor="price">ราคา (บาท) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0"
                  {...register("price")}
                  className={errors.price ? "border-red-500" : ""}
                />
                {errors.price && (
                  <p className="text-xs text-red-500 mt-1">{errors.price.message as string}</p>
                )}
              </div>

              <div>
                <Label htmlFor="categoryId">หมวดหมู่ *</Label>
                <select
                  id="categoryId"
                  {...register("categoryId")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">เลือกหมวดหมู่...</option>
                  {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-xs text-red-500 mt-1">{errors.categoryId.message as string}</p>
                )}
              </div>

              <div className="col-span-2">
                <Label htmlFor="description">คำอธิบาย</Label>
                <Textarea
                  id="description"
                  placeholder="รายละเอียดส่วนประกอบ รสชาติ..."
                  {...register("description")}
                  rows={3}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700">
              {isSubmitting ? "กำลังบันทึก..." : "บันทึกรายการอาหาร"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
