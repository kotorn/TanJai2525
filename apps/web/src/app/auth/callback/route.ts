import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (code) {
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        // 1. Exchange Code for Session
        const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error || !session) {
            console.error('Exchange Code Error:', error);
            return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_failed`);
        }

        // 2. Check if User exists in 'public.users'
        const { data: userRecord } = await supabase
            .from('users')
            .select('tenant_id')
            .eq('id', session.user.id)
            .single();

        // 3. Routing Logic
        // If No User Record -> New User -> Onboarding
        if (!userRecord || !userRecord.tenant_id) {
            return NextResponse.redirect(`${requestUrl.origin}/onboarding`);
        }

        // If User Record Exists -> Resolve Tenant Slug
        const { data: tenant } = await supabase
            .from('tenants')
            .select('slug')
            .eq('id', userRecord.tenant_id)
            .single();

        if (tenant) {
            // Redirect to their Tenant Dashboard
            // Using subdomain: return NextResponse.redirect(`https://${tenant.slug}.tanjai.app`);
            // OR using path (for MVP simplicity):
            return NextResponse.redirect(`${requestUrl.origin}/${tenant.slug}`);
        }
    }

    // Fallback
    return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}
