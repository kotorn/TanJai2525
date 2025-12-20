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

    // 2. Get Tenant by Slug
    const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', tenantSlug)
        .single();

    if (tenantError || !tenant) {
        console.error(`[Security] Tenant not found: ${tenantSlug}`);
        return notFound();
    }

    // 3. Verify User's Role for this Tenant
    // We check the public.users profile to see if they are linked to this tenant as 'owner'
    const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('tenant_id, role')
        .eq('id', user.id)
        .single();

    if (profileError || !profile) {
         console.warn(`[Security] User profile not found for ${user.id}`);
         throw new Error('User profile not found');
    }

    if (profile.tenant_id !== tenant.id || profile.role !== 'owner') {
        console.warn(`[Security] Unauthorized: User ${user.id} (Tenant: ${profile.tenant_id}) tried to access Tenant ${tenant.id}`);
        // Allow access if they are 'staff'?? For now strict 'owner' check for admin dashboard.
        // Or generic 'has access'
        throw new Error('Unauthorized: You do not have permission to access this store');
    }

    return { user, tenant };
}
