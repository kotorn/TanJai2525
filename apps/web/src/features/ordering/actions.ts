'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { CartService, type ServiceCartItem } from '@/services/cart-service';

// Export type alias for compatibility
export type CartItem = ServiceCartItem;

export async function submitOrder(restaurantId: string, tableId: string, items: CartItem[], totalAmount: number, specialInstructions?: string, promotionCode?: string, customerEmail?: string, customerPhone?: string) {
  const supabase = await createClient();
  
  // 1. Get User Context (Important for Service Layer & Notifications)
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Initialize Service with Dependencies
  const cartService = new CartService(supabase);

  try {
    // 3. Delegate Business Logic to Service
    const result = await cartService.createOrder({
      restaurantId,
      tableId,
      items,
      totalAmount,
      specialInstructions,
      userId: user?.id,
      promotionCode,
      customerEmail,
      customerPhone
    });

    // 4. [Event Simulation] Trigger LINE Notification
    // Ideally, the Service would emit an event, and a Listener would pick this up.
    // For now, the "Controller" (Action) acts as the orchestrator.
    if (user && user.app_metadata.provider === 'line') {
      import('@/lib/line').then(({ sendOrderNotification }) => {
        // Find the LINE provider ID safely
        const lineIdentity = user.identities?.find(i => i.provider === 'line');
        const lineUserId = lineIdentity?.provider_id || user.id;

        sendOrderNotification(
          lineUserId,
          result.orderId,
          totalAmount,
          items.map(i => ({ name: `Item ${i.menu_item_id}` })) // Placeholder names
        );
      }).catch(err => console.error('Failed to trigger LINE notification:', err));
    }

    // 5. Revalidate & Return
    revalidatePath(`/r/${restaurantId}/t/${tableId}`);
    return { success: true, orderId: result.orderId };

  } catch (error) {
    // The Service handles logging its own errors, but we catch/rethrow to bubble up to UI
    console.error('Submit Order Action Failed:', error);
    throw new Error('Failed to submit order');
  }
}
