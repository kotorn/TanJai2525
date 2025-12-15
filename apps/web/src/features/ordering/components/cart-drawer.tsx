'use client';

import { useCartStore } from '../cart-store';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { ShoppingBasket, Minus, Plus, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';
// import { submitOrder } from '../actions';
import { toast } from 'sonner';

export function CartDrawer({ restaurantId, tableId }: { restaurantId: string; tableId: string }) {
  const { items, removeItem, updateQuantity, total, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const cartTotal = total();

  const handleCheckout = async () => {
    // setIsSubmitting(true);
    // try {
    //     const result = await submitOrder(
    //         restaurantId, 
    //         tableId, 
    //         items.map(i => ({ menu_item_id: i.menuItemId, quantity: i.quantity, options: i.options, priceCheck: i.price })),
    //         cartTotal
    //     );
        
    //     if (result.success) {
    //         toast.success('Order placed successfully!');
    //         clearCart();
    //         setIsOpen(false);
    //     } else {
    //         toast.error('Failed to place order');
    //     }
    // } catch (error) {
    //     toast.error('An error occurred');
    //     console.error(error);
    // } finally {
    //     setIsSubmitting(false);
    // }
  };

  if (items.length === 0) return null;

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <div className="fixed bottom-4 right-4 left-4 z-50">
            <Button size="lg" className="w-full text-lg shadow-xl" onClick={() => setIsOpen(true)}>
                <ShoppingBasket className="mr-2 h-5 w-5" />
                View Cart ({items.reduce((acc, i) => acc + i.quantity, 0)})
                <span className="ml-auto font-bold">฿{cartTotal}</span>
            </Button>
        </div>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Your Order</DrawerTitle>
          </DrawerHeader>
          
          <ScrollArea className="h-[50vh] p-4">
            <div className="flex flex-col gap-4">
                {items.map((item) => (
                    <div key={item.menuItemId} className="flex justify-between items-center border-b pb-4 last:border-0">
                        <div className="flex-1">
                            <h4 className="font-semibold">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">฿{item.price * item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-2">
                             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.menuItemId, -1)}>
                                <Minus className="h-3 w-3" />
                             </Button>
                             <span className="w-4 text-center text-sm">{item.quantity}</span>
                             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.menuItemId, 1)}>
                                <Plus className="h-3 w-3" />
                             </Button>
                             <Button variant="destructive" size="icon" className="h-8 w-8 ml-2" onClick={() => removeItem(item.menuItemId)}>
                                <Trash2 className="h-3 w-3" />
                             </Button>
                        </div>
                    </div>
                ))}
            </div>
          </ScrollArea>

          <DrawerFooter>
            <div className="flex justify-between items-center mb-4 text-lg font-bold">
                <span>Total</span>
                <span>฿{cartTotal}</span>
            </div>
            <Button size="lg" onClick={handleCheckout} disabled={isSubmitting}>
                {isSubmitting ? 'Placing Order...' : 'Confirm Order'}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
