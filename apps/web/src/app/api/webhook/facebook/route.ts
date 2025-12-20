import { NextRequest, NextResponse } from 'next/server';
import { verifyFacebookSignature } from '@/features/social-commerce/security';
import { SocialIncomingHandler } from '@/features/social-commerce/handlers/social-incoming-handler';

/**
 * GET Handler for Facebook Webhook verification (Challenge)
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    const verifyToken = process.env.FACEBOOK_VERIFY_TOKEN;

    if (mode && token) {
        if (mode === 'subscribe' && token === verifyToken) {
            console.log('[Facebook Webhook] Verified');
            return new Response(challenge, { status: 200 });
        } else {
            return new Response('Forbidden', { status: 403 });
        }
    }
    return new Response('Bad Request', { status: 400 });
}

/**
 * POST Handler for Facebook Webhook events
 */
export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get('x-hub-signature-256') || '';
    const appSecret = process.env.FACEBOOK_APP_SECRET || '';

    // 1. Verify Signature
    if (!verifyFacebookSignature(body, signature, appSecret)) {
        console.error('[Facebook Webhook] Invalid Signature');
        return NextResponse.json({ error: 'Invalid Signature' }, { status: 401 });
    }

    try {
        const payload = JSON.parse(body);

        if (payload.object === 'page') {
            for (const entry of payload.entry) {
                const messaging = entry.messaging || [];
                for (const event of messaging) {
                    if (event.message && event.message.text) {
                        await SocialIncomingHandler.handleMessage({
                            provider: 'facebook',
                            channel: 'facebook_messenger',
                            providerUserId: event.sender.id,
                            content: event.message.text,
                            externalId: event.message.mid,
                            metadata: {
                                fb_event: event,
                                page_id: entry.id,
                                // Dynamic restaurant mapping should be handled here
                                restaurant_id: req.nextUrl.searchParams.get('restaurant_id')
                            }
                        });
                    }
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Facebook Webhook] Error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
