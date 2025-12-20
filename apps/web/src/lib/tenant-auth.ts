import { createClient } from './supabase/server';
import { notFound, redirect } from 'next/navigation';
import { User } from '@supabase/supabase-js';

/**
 * Validates if the current authenticated user owns the specified tenant.
 * Used in Server Actions and Page components to ensure cross-tenant security.
 */
export async function validateTenantOwnership(tenantSlug: string): Promise<{ user: User; tenant: { id: string } }> {
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

    // Explicit checks to satisfy TS narrowing
    if (profile.tenant_id !== tenant.id) {
        console.warn(`[Security] Unauthorized: Tenant Mismatch`);
        throw new Error('Unauthorized: You do not have permission to access this store');
    }

    if (profile.role !== 'owner') {
        console.warn(`[Security] Unauthorized: Role Mismatch`);
        throw new Error('Unauthorized: You do not have permission to access this store');
    }

    return { user, tenant };
}

/**
 * Validates if the current authenticated user is a Super Admin.
 * Used for SaaS Admin pages.
 */
export async function validateSuperAdmin(): Promise<{ user: User }> {
    const supabase = createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect('/login');
    }

    // We explicitly type the data interaction if inference fails in certain environments
    const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profileError || !profile) {
        throw new Error('User profile not found');
    }

    const userProfile = profile as { role: string };

    if (userProfile.role !== 'super_admin') {
        throw new Error('Unauthorized: Super Admin access required');
    }

    return { user };
}
