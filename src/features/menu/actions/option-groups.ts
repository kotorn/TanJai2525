'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Types
export type OptionGroup = {
    id: string
    name: string
    required: boolean
    min_selection: number
    max_selection: number
    options: Option[]
}

export type Option = {
    id: string
    name: string
    price: number // mapped from price_modifier
    is_default: boolean
    is_available: boolean
}

const OptionGroupSchema = z.object({
    name: z.string().min(1),
    required: z.boolean(),
    min_selection: z.number().min(0),
    max_selection: z.number().min(1),
    options: z.array(z.object({
        id: z.string().optional(),
        name: z.string().min(1),
        price: z.number(),
        is_default: z.boolean(),
        is_available: z.boolean().optional()
    }))
})

export async function getOptionGroups(restaurantId: string) {
    const supabase = await createClient()
    
    const { data, error } = await supabase
        .from('option_groups')
        .select(`
            *,
            options (*)
        `)
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching option groups:', error)
        return []
    }

    // Map to frontend friendly structure if needed (param names match DB mostly)
    return data.map((g: any) => ({
        ...g,
        options: g.options.map((o: any) => ({
            ...o,
            price: o.price_modifier // Remap for frontend consistency
        })).sort((a: any, b: any) => a.sort_order - b.sort_order)
    }))
}

export async function saveOptionGroup(restaurantId: string, data: any) {
    const supabase = await createClient()
    
    // Validate
    const result = OptionGroupSchema.safeParse(data);
    if (!result.success) return { error: "Invalid data" };
    
    const groupData = result.data;

    // 1. Upsert Group
    const { data: group, error: groupError } = await supabase
        .from('option_groups')
        .upsert({
            id: data.id, // If present, update
            restaurant_id: restaurantId,
            name: groupData.name,
            required: groupData.required,
            min_selection: groupData.min_selection,
            max_selection: groupData.max_selection
        })
        .select()
        .single();

    if (groupError || !group) return { error: groupError?.message || "Failed to save group" };

    // 2. Handle Options
    // Strategy: Delete existing for this group and recreate? Or smart upsert?
    // Smart upsert requires handling IDs.
    
    // For simplicity in this fix: Upsert loop
    const optionPromises = groupData.options.map((opt, index) => {
        return supabase.from('options').upsert({
            id: opt.id, // Update if exists
            group_id: group.id,
            name: opt.name,
            price_modifier: opt.price,
            is_default: opt.is_default,
            is_available: opt.is_available ?? true,
            sort_order: index
        })
    });

    await Promise.all(optionPromises);

    revalidatePath('/dashboard/menu');
    return { success: true, data: group };
}

export async function deleteOptionGroup(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('option_groups').delete().eq('id', id);
    if (error) return { error: error.message };
    revalidatePath('/dashboard/menu');
    return { success: true };
}
