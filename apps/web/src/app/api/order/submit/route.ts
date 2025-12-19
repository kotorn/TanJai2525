import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();

    // Validate required fields
    const { restaurant_id, table_id, items, total_amount } = body;
    
    if (!restaurant_id || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: restaurant_id, items' },
        { status: 400 }
      );
    }

    // Insert order
    const { data, error } = await supabase
      .from('orders')
      .insert({
        restaurant_id,
        table_id: table_id || null,
        items,
        total_amount,
        customer_notes: body.customer_notes || null,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create order', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      order: data 
    }, { status: 201 });

  } catch (error) {
    console.error('Order submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
