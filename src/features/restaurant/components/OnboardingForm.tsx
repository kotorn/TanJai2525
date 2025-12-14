"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createRestaurant } from "../actions";
import { uploadRestaurantAsset } from "@/lib/supabase/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const formSchema = z.object({
    name: z.string().min(2, "Name is required"),
    slug: z.string().min(3, "Slug is required"),
    cuisine_type: z.string().min(2, "Cuisine is required"),
    phone: z.string().min(9, "Phone is required"),
    address: z.string().optional(),
});

export default function OnboardingForm() {
    const [step, setStep] = useState(1);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const { register, handleSubmit, formState: { errors }, watch } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            slug: "",
            cuisine_type: "Thai",
            phone: "",
            address: ""
        }
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        let logoUrl = "";

        try {
            if (logoFile) {
                logoUrl = await uploadRestaurantAsset(logoFile);
            }

            const result = await createRestaurant({
                ...values,
                logo_url: logoUrl,
            });

            if (result.error) {
                toast.error(result.error);
                return;
            }

            toast.success("Restaurant created successfully!");
            router.push("/dashboard");

        } catch (err) {
            console.error(err);
            toast.error("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    return (
        <Card className="w-full max-w-md mx-auto mt-10">
            <CardHeader>
                <CardTitle>Setup your Restaurant (Step {step}/2)</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">

                    {/* STEP 1: Basic Info */}
                    {step === 1 && (
                        <>
                            <div className="space-y-1">
                                <Label htmlFor="name">Restaurant Name</Label>
                                <Input id="name" {...register("name")} placeholder="Tanjai Kitchen" />
                                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="slug">Restaurant URL (Slug)</Label>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground text-sm">tanjai.app/r/</span>
                                    <Input id="slug" {...register("slug")} placeholder="tanjai-kitchen" />
                                </div>
                                {errors.slug && <p className="text-sm text-red-500">{errors.slug.message}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" {...register("phone")} placeholder="081-234-5678" />
                                {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                            </div>
                        </>
                    )}

                    {/* STEP 2: Details & Branding */}
                    {step === 2 && (
                        <>
                            <div className="space-y-1">
                                <Label htmlFor="cuisine">Cuisine Type</Label>
                                <Input id="cuisine" {...register("cuisine_type")} placeholder="Thai Street Food" />
                                {errors.cuisine_type && <p className="text-sm text-red-500">{errors.cuisine_type.message}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="address">Address (Optional)</Label>
                                <Input id="address" {...register("address")} placeholder="123 Sukhumvit Rd..." />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="logo">Logo (Optional)</Label>
                                <Input
                                    id="logo"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) setLogoFile(e.target.files[0]);
                                    }}
                                />
                            </div>
                        </>
                    )}

                </CardContent>
                <CardFooter className="flex justify-between">
                    {step > 1 && (
                        <Button type="button" variant="outline" onClick={prevStep} disabled={loading}>
                            Back
                        </Button>
                    )}
                    {step < 2 ? (
                        <Button type="button" onClick={nextStep} className="ml-auto">
                            Next
                        </Button>
                    ) : (
                        <Button type="submit" disabled={loading} className="instance_class ml-auto">
                            {loading ? "Creating..." : "Finish Setup"}
                        </Button>
                    )}
                </CardFooter>
            </form>
        </Card>
    );
}
