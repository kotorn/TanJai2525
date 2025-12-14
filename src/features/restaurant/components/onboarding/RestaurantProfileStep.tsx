"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { restaurantProfileSchema, type RestaurantProfile } from "@/features/restaurant/schemas/onboarding.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { uploadRestaurantAsset } from "@/lib/supabase/storage";
import { registerRestaurant } from "@/features/restaurant/actions";
interface RestaurantProfileStepProps {
    phoneNumber: string;
    onCompleted: (restaurantId: string) => void;
}

export function RestaurantProfileStep({ phoneNumber, onCompleted }: RestaurantProfileStepProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<RestaurantProfile>({
        resolver: zodResolver(restaurantProfileSchema),
    });

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            try {
                const publicUrl = await uploadRestaurantAsset(file, "restaurant-assets");
                setValue("logoUrl", publicUrl);
            } catch (error) {
                console.error("Logo upload failed", error);
            }
        }
    };

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setBannerPreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            try {
                const publicUrl = await uploadRestaurantAsset(file, "restaurant-assets");
                setValue("bannerUrl", publicUrl);
            } catch (error) {
                console.error("Banner upload failed", error);
            }
        }
    };

    const onSubmit = async (data: RestaurantProfile) => {
        setIsLoading(true);

        try {
            const result = await registerRestaurant({
                ...data,
                phoneNumber,
            });

            if (result.success && result.restaurantId) {
                onCompleted(result.restaurantId);
            } else {
                console.error("Registration failed:", result.error);
                // Optionally set global error
            }
        } catch (error) {
            console.error("Registration error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    ข้อมูลร้านอาหาร
                </h1>
                <p className="text-gray-600">
                    กรุณากรอกข้อมูลร้านของคุณ
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Restaurant Name */}
                <div>
                    <Label htmlFor="name">ชื่อร้าน *</Label>
                    <Input
                        id="name"
                        placeholder="เช่น ร้านส้มตำแซ่บ"
                        {...register("name")}
                        className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && (
                        <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                    )}
                </div>

                {/* Address */}
                <div>
                    <Label htmlFor="address">ที่อยู่ *</Label>
                    <Textarea
                        id="address"
                        placeholder="123 ถนนสุขุมวิท แขวง... เขต... กรุงเทพฯ 10110"
                        {...register("address")}
                        className={errors.address ? "border-red-500" : ""}
                        rows={3}
                    />
                    {errors.address && (
                        <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>
                    )}
                </div>

                {/* Cuisine Type */}
                <div>
                    <Label htmlFor="cuisineType">ประเภทอาหาร *</Label>
                    <Input
                        id="cuisineType"
                        placeholder="เช่น อาหารไทย, อาหารญี่ปุ่น, คาเฟ่"
                        {...register("cuisineType")}
                        className={errors.cuisineType ? "border-red-500" : ""}
                    />
                    {errors.cuisineType && (
                        <p className="text-sm text-red-600 mt-1">{errors.cuisineType.message}</p>
                    )}
                </div>

                {/* Description (Optional) */}
                <div>
                    <Label htmlFor="description">คำอธิบาย (ไม่จำเป็น)</Label>
                    <Textarea
                        id="description"
                        placeholder="บอกลูกค้าเกี่ยวกับร้านของคุณ..."
                        {...register("description")}
                        rows={2}
                    />
                </div>

                {/* Logo Upload */}
                <div>
                    <Label>โลโก้ร้าน (ไม่จำเป็น)</Label>
                    <div className="mt-2">
                        <label
                            htmlFor="logo-upload"
                            className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 cursor-pointer transition-colors"
                        >
                            {logoPreview ? (
                                <img
                                    src={logoPreview}
                                    alt="Logo preview"
                                    className="h-full object-contain"
                                />
                            ) : (
                                <div className="text-center">
                                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-600">อัพโหลดโลโก้</p>
                                    <p className="text-xs text-gray-500">PNG, JPG (แนะนำ 512x512px)</p>
                                </div>
                            )}
                        </label>
                        <input
                            id="logo-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleLogoUpload}
                        />
                    </div>
                </div>

                {/* Banner Upload */}
                <div>
                    <Label>แบนเนอร์ (ไม่จำเป็น)</Label>
                    <div className="mt-2">
                        <label
                            htmlFor="banner-upload"
                            className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 cursor-pointer transition-colors"
                        >
                            {bannerPreview ? (
                                <img
                                    src={bannerPreview}
                                    alt="Banner preview"
                                    className="h-full w-full object-cover rounded"
                                />
                            ) : (
                                <div className="text-center">
                                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-600">อัพโหลดแบนเนอร์</p>
                                    <p className="text-xs text-gray-500">PNG, JPG (แนะนำ 1920x480px)</p>
                                </div>
                            )}
                        </label>
                        <input
                            id="banner-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleBannerUpload}
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    disabled={isLoading}
                >
                    {isLoading ? "กำลังสร้างร้าน..." : "สร้างร้าน"}
                </Button>
            </form>
        </div>
    );
}
