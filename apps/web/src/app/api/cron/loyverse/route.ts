import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

import { syncLoyverseReceipts } from '@/lib/loyverse/sync';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function matchesSecret(actual: string, expected: string): boolean {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(`Bearer ${expected}`);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  const authorization = request.headers.get('authorization') || '';

  if (!cronSecret) {
    return NextResponse.json({ ok: false, error: 'Cron is not configured.' }, { status: 500 });
  }

  if (!matchesSecret(authorization, cronSecret)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const result = await syncLoyverseReceipts();
    return NextResponse.json({ ok: true, source: 'loyverse', ...result });
  } catch (error) {
    console.error('[Loyverse Cron] Receipt sync failed', error);
    return NextResponse.json({ ok: false, error: 'Loyverse sync failed.' }, { status: 500 });
  }
}
