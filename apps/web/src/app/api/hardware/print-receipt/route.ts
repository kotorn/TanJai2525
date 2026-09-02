import { NextRequest, NextResponse } from 'next/server';
import { isReceiptPayload, printReceipt } from '@/lib/server/hardware-bridge';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON payload' }, { status: 400 });
  }

  if (!isReceiptPayload(body)) {
    return NextResponse.json({ success: false, error: 'Invalid receipt payload' }, { status: 400 });
  }

  try {
    const result = await printReceipt(body);
    return NextResponse.json(result, { status: result.success ? 200 : 502 });
  } catch (error) {
    console.error('[Hardware API] print receipt failed:', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ success: false, error: 'Hardware bridge is unavailable' }, { status: 503 });
  }
}
