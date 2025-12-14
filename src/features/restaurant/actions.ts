"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CreateRestaurantSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug must use lowercase letters, numbers, and dashes only"),
    cuisine_type: z.string().min(2, "Cuisine is required"),
    phone: z.string().min(9, "Phone number is required"),
    address: z.string().optional(),
    logo_url: z.string().optional(),
    banner_url: z.string().optional(),
});

export async function createRestaurant(data: z.infer<typeof CreateRestaurantSchema>) {
    const supabase = await createClient();
    const result = CreateRestaurantSchema.safeParse(data);

    if (!result.success) {
        return { error: "Invalid data", details: result.error.flatten() };
    }

    const { name, slug, cuisine_type, phone, address, logo_url, banner_url } = result.data;

    // Insert into tenants table
    const { data: tenant, error } = await supabase
        .from("tenants")
        .insert({
            name,
            slug,
            cuisine_type,
            phone,
            address,
            logo_url,
            banner_url,
        })
        .select()
        .single();

    if (error) {
        console.error("Failed to create restaurant", error);
        if (error.code === '23505') { // Unique violation for slug
            return { error: "This URL (slug) is already taken. Please choose another." };
        }
        return { error: "Failed to create restaurant. Please try again." };
    }

    // In a real app, we would link this tenant to the authenticated user here.
    // For now, we assume RLS checks or subsequent logic handles user association.

    revalidatePath("/dashboard");
    return { success: true, tenantId: tenant.id };
}
