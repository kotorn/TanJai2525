import { createClient } from './supabase/server';
import { notFound } from 'next/navigation';

/**
 * Validates if the current authenticated user owns the specified tenant.
 * Used in Server Actions and Page components to ensure cross-tenant security.
 */
export async function validateTenantOwnership(tenantSlug: string) {
    const supabase = createClient();

    // 1. Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error('Authentication required');
    }

    // 2. Check restaurant ownership
    // Assuming 'restaurants' table has 'slug' and 'owner_id'
    const { data: restaurant, error: resError } = await supabase
        .from('restaurants')
        .select('id, owner_id')
        .eq('slug', tenantSlug)
        .single();

    if (resError || !restaurant) {
        console.error(`[Security] Tenant not found: ${tenantSlug}`);
        return notFound();
    }

    if (restaurant.owner_id !== user.id) {
        console.warn(`[Security] Unauthorized access attempt: User ${user.id} tried to access tenant ${tenantSlug}`);
        throw new Error('Unauthorized: You do not own this store');
    }

    return { user, restaurant };
}
