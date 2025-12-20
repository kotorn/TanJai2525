import { createClient } from '@/lib/supabase/client';

const SLIP_BUCKET = 'slips';

export async function uploadSlip(file: File, tenantId: string): Promise<{ path: string; fullPath: string; error?: any }> {
    const supabase = createClient();

    // Validate file size (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        return { path: '', fullPath: '', error: 'File size must be less than 5MB' };
    }

    // Path structure: tenants/{tenantId}/slips/{timestamp}_{filename}
    // Sanitize filename to avoid weird chars
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `tenants/${tenantId}/slips/${Date.now()}_${sanitizedName}`;

    const { data, error } = await supabase
        .storage
        .from(SLIP_BUCKET)
        .upload(path, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('Upload Error:', error);
        return { path: '', fullPath: '', error: error.message };
    }

    // Get Public URL (if bucket is public) or Signed URL?
    // Usually for admin review, a signed URL or authenticated download is better.
    // But for simplicity in this flow, we might just store the path and let the backend generate signed URLs for admins.
    // However, the `upgradeSubscription` action expects a URL.
    // Let's get the public URL for now assuming the bucket is public-read for authenticated users (or public).

    const { data: publicData } = supabase.storage.from(SLIP_BUCKET).getPublicUrl(data.path);

    return {
        path: data.path,
        fullPath: publicData.publicUrl,
        error: undefined
    };
}
