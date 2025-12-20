'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function uploadPaymentSlip(formData: FormData) {
    const supabase = createClient();

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('Unauthorized');
    }

    // 2. Validate Input
    const file = formData.get('slip_image') as File;
    const amount = formData.get('amount') as string;
    const tenantSlug = formData.get('tenant_slug') as string;

    if (!file || !amount || !tenantSlug) {
        throw new Error('Missing required fields');
    }

    // 3. Resolve Tenant ID
    const { data: tenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', tenantSlug)
        .single();

    if (!tenant) throw new Error('Tenant not found');

    // Verify ownership? (Optional but good)
    const { data: profile } = await supabase
        .from('users')
        .select('tenant_id, role')
        .eq('id', user.id)
        .single();

    if (profile?.tenant_id !== tenant.id || profile?.role !== 'owner') {
        throw new Error('Unauthorized: You are not the owner of this store');
    }

    // 4. Resolve Subscription ID
    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('tenant_id', tenant.id)
        .single();

    let subscriptionId = subscription?.id;

    // If no subscription exists, create one (e.g. they are new/free upgrading)
    if (!subscriptionId) {
        const { data: newSub, error: subError } = await supabase
            .from('subscriptions')
            .insert({
                tenant_id: tenant.id,
                plan_id: 'free',
                status: 'pending_verification',
                start_date: new Date().toISOString()
            })
            .select('id')
            .single();

        if (subError || !newSub) throw new Error('Failed to create subscription record');
        subscriptionId = newSub.id;
    }

    // 5. Upload File to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const filePath = `${tenant.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from('payment_slips')
        .upload(filePath, file);

    if (uploadError) {
        throw new Error('Upload failed: ' + uploadError.message);
    }

    // 6. Insert Payment Slip Record
    // We need the Public URL? Or just the path?
    // Since bucket is private, we store the path or a signed URL generator reference.
    // Ideally, store the path and generate signed URLs on display.
    // But let's check `payment_slips` table schema. `slip_image_url` text.
    // Let's store the full path or relative path.

    // NOTE: Schema expects `slip_image_url`, let's assume valid URL or path.
    // For private buckets, usually we store the path.

    const { error: insertError } = await supabase
        .from('payment_slips')
        .insert({
            subscription_id: subscriptionId,
            amount: parseFloat(amount),
            slip_image_url: filePath,
            status: 'pending',
        });

    if (insertError) {
        throw new Error('Database insert failed: ' + insertError.message);
    }

    // 7. Update Subscription Status to 'pending_verification' IF it was expired
    await supabase
        .from('subscriptions')
        .update({ status: 'pending_verification' })
        .eq('id', subscriptionId);

    // 8. Revalidate & Redirect
    revalidatePath('/subscription/expired');
    return { success: true };
}
