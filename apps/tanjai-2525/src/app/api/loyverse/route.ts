import { NextRequest, NextResponse } from 'next/server';
import { apiGuard } from '@/lib/api-auth';

/**
 * Loyverse Webhook Handler
 */
export async function POST(request: NextRequest) {
  // Security Guard
  const guardResult = apiGuard(request);
  if (guardResult) return guardResult;

  try {
    const body = await request.json();
    
    console.log('Loyverse Webhook Received:', body);

    // TODO: Implement webhook handlers
    // 1. Verify webhook signature
    // 2. Process event type
    // 3. Update Supabase accordingly

    return NextResponse.json({ 
      received: true,
      message: 'Webhook processed successfully',
    });
  } catch (error) {
    console.error('Loyverse Webhook Error:', error);
    
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

/**
 * Manual Product Sync Trigger
 * 
 * Call this endpoint to manually sync products from Loyverse
 */
export async function GET(request: NextRequest) {
  // Security Guard
  const guardResult = apiGuard(request);
  if (guardResult) return guardResult;

  const { createLoyverseClient } = await import('@/lib/loyverse');
  
  try {
    const client = createLoyverseClient();
    const result = await client.syncProducts();

    return NextResponse.json({
      success: true,
      message: 'Product sync completed',
      synced: result.synced,
      errors: result.errors,
    });
  } catch (error: any) {
    console.error('Loyverse Sync Error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to sync products' },
      { status: 500 }
    );
  }
}
