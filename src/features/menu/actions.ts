"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// --- VALIDATION SCHEMAS ---
const CategorySchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    sort_order: z.number().default(0),
});

const MenuItemSchema = z.object({
    name: z.string().min(1, "Name is required"),
    price: z.number().min(0, "Price must be positive"),
    category_id: z.string().uuid("Category is required"),
    description: z.string().optional(),
    image_url: z.string().optional(),
    is_available: z.boolean().default(true),
});

// --- ACTIONS ---

export async function getMenuData() {
    const supabase = await createClient();

    const { data: categories, error: catError } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });

    if (catError) throw new Error(catError.message);

    const { data: items, error: itemError } = await supabase
        .from("menu_items")
        .select("*")
        .order("sort_order", { ascending: true });

    if (itemError) throw new Error(itemError.message);

    return { categories, items };
}

export async function createCategory(data: z.infer<typeof CategorySchema>) {
    const supabase = await createClient();
    const validation = CategorySchema.safeParse(data);

    if (!validation.success) return { error: "Invalid data" };

    const { error } = await supabase
        .from("categories")
        .insert({
            name: validation.data.name,
            sort_order: validation.data.sort_order,
        });

    if (error) return { error: error.message };
    revalidatePath("/dashboard/menu");
    return { success: true };
}

export async function deleteCategory(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/dashboard/menu");
    return { success: true };
}


export async function createMenuItem(data: z.infer<typeof MenuItemSchema>) {
    const supabase = await createClient();
    const validation = MenuItemSchema.safeParse(data);

    if (!validation.success) return { error: "Invalid data" };

    const { error } = await supabase.from("menu_items").insert(validation.data);

    if (error) return { error: error.message };
    revalidatePath("/dashboard/menu");
    return { success: true };
}

export async function deleteMenuItem(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/dashboard/menu");
    return { success: true };
}
