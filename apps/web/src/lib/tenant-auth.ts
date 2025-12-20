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

/**
 * Validates if the tenant has an active subscription.
 * Redirects to /subscription/expired if not active.
 * Bypasses check if the user is a Super Admin.
 */
export async function validateSubscription(tenantSlug: string) {
    const supabase = createClient();

    // 1. Resolve Tenant ID from Slug
    const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', tenantSlug)
        .single();

    if (tenantError || !tenant) return; // Should be handled by page 404 primarily, but safe to return

    // 2. Check Subscription Status
    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('status, plan_id, end_date')
        .eq('tenant_id', tenant.id)
        .single();

    // Default to 'free' or 'active' logic if no record found? 
    // Strict Mode: No record = Expired immediately (unless free tier is implicit)
    // For now, let's assume if no record -> Check if User is Super Admin, otherwise Block.

    const isActive = subscription && (
        subscription.status === 'active' ||
        subscription.plan_id === 'free' ||
        (subscription.end_date && new Date(subscription.end_date) > new Date())
    );

    if (isActive) return; // All good

    // 3. Subscription Failed - Check for Super Admin Bypass
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile && profile.role === 'super_admin') {
            // Allow access but maybe log or warn?
            return;
        }
    }

    // 4. Block Access
    const isPending = subscription?.status === 'pending_verification';
    redirect(`/subscription/expired?tenant=${tenantSlug}${isPending ? '&status=pending' : ''}`);
}
