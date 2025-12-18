'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export type CartItem = {
  menu_item_id: string;
  quantity: number;
  options?: any;
  priceCheck: number; // For validation
};

export async function submitOrder(restaurantId: string, tableId: string, items: CartItem[], totalAmount: number, specialInstructions?: string) {
  'use server';
  
  const supabase = await createClient(); // Use the await keyword here

  // 1. Validate Items & Price (Server-side)
  // TODO: Fetch real prices from DB to verify totalAmount. For now, we trust the input but it's risky.
  // Ideally:
  // const { data: menuItems } = await supabase.from('menu_items').select('id, price').in('id', items.map(i => i.menu_item_id));
  
  // 2. Create Order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      restaurant_id: restaurantId,
      table_no: tableId,
      status: 'pending',
      total_amount: totalAmount,
      special_instructions: specialInstructions
    })
    .select()
    .single();

  if (orderError) {
    console.error('Submit Order Error:', orderError);
    throw new Error('Failed to submit order');
  }

  // 3. Create Order Items
  const orderItemsData = items.map(item => ({
    order_id: order.id,
    menu_item_id: item.menu_item_id,
    quantity: item.quantity,
    price: item.priceCheck, // Snapshot price
    modifiers: item.options || {}
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItemsData);

  if (itemsError) {
     console.error('Submit Order Items Error:', itemsError);
     // Note: In a real app we might want to rollback the order here (manual transaction)
     throw new Error('Failed to save order items');
  }

  // 4. Trigger LINE Notification (Async, don't block response)
  const { data: { user } } = await supabase.auth.getUser();
  if (user && user.app_metadata.provider === 'line') {
      import('@/lib/line').then(({ sendOrderNotification }) => {
          sendOrderNotification(
              user.identities?.find(i => i.provider === 'line')?.provider_id || user.id,
              order.id,
              totalAmount,
              items.map(i => ({ name: `Item ${i.menu_item_id}` })) // Placeholder names
          );
      }).catch(err => console.error('Failed to trigger LINE notification:', err));
  }

  // 5. Revalidate & Redirect
  revalidatePath(`/r/${restaurantId}/t/${tableId}`);
  return { success: true, orderId: order.id };
}
