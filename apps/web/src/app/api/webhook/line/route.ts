import { NextRequest, NextResponse } from 'next/server';
import { verifyLineSignature } from '@/features/social-commerce/security';
import { SocialIncomingHandler } from '@/features/social-commerce/handlers/social-incoming-handler';

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get('x-line-signature') || '';
    const channelSecret = process.env.LINE_CHANNEL_SECRET || '';

    // 1. Verify Signature
    if (!verifyLineSignature(body, signature, channelSecret)) {
        console.error('[LINE Webhook] Invalid Signature');
        return NextResponse.json({ error: 'Invalid Signature' }, { status: 401 });
    }

    try {
        const payload = JSON.parse(body);
        const events = payload.events || [];

        for (const event of events) {
            if (event.type === 'message' && event.message.type === 'text') {
                await SocialIncomingHandler.handleMessage({
                    provider: 'line',
                    channel: 'line_oa',
                    providerUserId: event.source.userId,
                    content: event.message.text,
                    externalId: event.message.id,
                    metadata: {
                        line_event: event,
                        // In a multi-tenant setup, you'd map the Line Channel ID to a restaurant_id
                        restaurant_id: req.nextUrl.searchParams.get('restaurant_id')
                    }
                });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[LINE Webhook] Error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
