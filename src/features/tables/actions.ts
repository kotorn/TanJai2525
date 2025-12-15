'use server'

import { createClient } from '@/lib/supabase/server'
import { getRestaurantId } from '@/lib/supabase/helpers'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { Table } from '@/types/database.types'

const TableSchema = z.object({
    name: z.string().min(1, "Name is required"),
    capacity: z.number().min(1, "Capacity must be at least 1"),
    location: z.string().optional(),
})

// Reuse our helper from menu actions (ideally move to a shared lib)

export async function getTables() {
    const supabase = await createClient();
    
    const { data, error } = await supabase
        .from('tables')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching tables:', error);
        return [];
    }

    return (data as Table[]) || [];
}

export async function createTable(data: z.infer<typeof TableSchema>) {
    const supabase = await createClient();

    const valid = TableSchema.safeParse(data);
    if (!valid.success) return { error: "Invalid data" };

    const restaurant_id = await getRestaurantId(supabase);
    // If no restaurant, we handle logically or let RLS fail/mock.
    
    // Check if table exists (optional, unique name per restaurant?)
    
    const payload: any = { 
        ...valid.data, 
        status: 'available',
        restaurant_id // might be null if not found
    };
    if (restaurant_id) payload.restaurant_id = restaurant_id;

    const { error } = await supabase.from('tables').insert(payload);

    if (error) return { error: error.message };
    revalidatePath('/dashboard/tables');
    return { success: true };
}

export async function deleteTable(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('tables').delete().eq('id', id);
    if (error) return { error: error.message };
    revalidatePath('/dashboard/tables');
    return { success: true };
}
