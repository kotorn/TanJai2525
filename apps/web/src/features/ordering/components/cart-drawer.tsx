'use client';

import { useCartStore } from '../cart-store';
import { Button } from "@tanjai/ui";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerFooter, DrawerClose } from "@tanjai/ui";
import { ShoppingBasket, Minus, Plus, Trash2 } from 'lucide-react';
import { ScrollArea } from "@tanjai/ui";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitOrder } from '../actions';
import { toast } from 'sonner';
import { Input } from "@tanjai/ui";
import { offlineService } from '@/services/offline-service';

export function CartDrawer({ restaurantId, tableId }: { restaurantId: string; tableId: string }) {
  const { items, removeItem, updateQuantity, total, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const router = useRouter();

  const cartTotal = total();

  const handleCheckout = async () => {
    setIsSubmitting(true);
    try {
        // [OFFLINE MODE INTERCEPTION]
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            console.log('[CartDrawer] Offline detected, queuing order...');
            
            await offlineService.saveOrder({
                restaurantId,
                tableId,
                items: items.map(i => ({ menu_item_id: i.menuItemId, quantity: i.quantity, options: i.options, priceCheck: i.price })),
                totalAmount: cartTotal,
                specialInstructions: undefined,
                promotionCode: promoCode || undefined,
                customerEmail: customerEmail || undefined,
                // Note: customerPhone is missing in state, assumes undefined
            });

            toast.warning('🌐 Offline Mode: Order saved locally!', {
                description: 'We will upload it automatically when internet returns.',
                duration: 5000,
            });
            
            clearCart();
            setIsOpen(false);
            // Redirect to a specific offline success page or just the success page (if it works offline)
            // For now, assume success page might need Order ID. 
            // We'll use a placeholder "offline_queued" ID.
            router.push(`/order/success/offline_queued`);
            return;
        }

        const result = await submitOrder(
            restaurantId, 
            tableId, 
            items.map(i => ({ menu_item_id: i.menuItemId, quantity: i.quantity, options: i.options, priceCheck: i.price })),
            cartTotal,
            undefined, // specialInstructions
            promoCode,
            customerEmail || undefined // Only pass if not empty
        );
        
        if (result.success) {
            toast.success('🎉 ออเดอร์ของคุณส่งเรียบร้อยแล้ว!');
            clearCart();
            setIsOpen(false);
            router.push(`/order/success/${result.orderId}`);
        } else {
            toast.error('Failed to place order');
        }
    } catch (error) {
        toast.error('An error occurred');
        console.error(error);
    } finally {
        setIsSubmitting(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <div className="fixed bottom-4 right-4 left-4 z-50">
            <Button size="lg" className="w-full text-lg shadow-glow bg-BURNT_ORANGE hover:bg-BURNT_ORANGE/90 text-white rounded-2xl py-7 font-display" onClick={() => setIsOpen(true)}>
                <ShoppingBasket className="mr-2 h-6 w-6" />
                <span>ตะกร้าของฉัน ({items.reduce((acc, i) => acc + i.quantity, 0)})</span>
                <span className="ml-auto font-black">฿{cartTotal}</span>
            </Button>
        </div>
      </DrawerTrigger>
      <DrawerContent className="bg-[#121212] border-white/5 text-white">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="font-display text-2xl">ออเดอร์ของคุณ</DrawerTitle>
          </DrawerHeader>
          
          <ScrollArea className="h-[45vh] p-4">
            <div className="flex flex-col gap-4">
                {items.map((item) => (
                    <div key={item.menuItemId} className="flex justify-between items-center border-b border-white/5 pb-4 last:border-0">
                        <div className="flex-1">
                            <h4 className="font-semibold text-TEXT_PRIMARY">{item.name}</h4>
                            <p className="text-sm text-TEXT_SECONDARY font-mono">฿{item.price * item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-2">
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-TEXT_SECONDARY hover:bg-white/5" onClick={() => updateQuantity(item.menuItemId, -1)}>
                                <Minus className="h-4 w-4" />
                             </Button>
                             <span className="w-4 text-center text-sm font-bold">{item.quantity}</span>
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-TEXT_SECONDARY hover:bg-white/5" onClick={() => updateQuantity(item.menuItemId, 1)}>
                                <Plus className="h-4 w-4" />
                             </Button>
                             <Button variant="ghost" size="icon" className="h-8 w-8 ml-2 text-ERROR/80 hover:bg-ERROR/10" onClick={() => removeItem(item.menuItemId)}>
                                <Trash2 className="h-4 w-4" />
                             </Button>
                        </div>
                    </div>
                ))}
            </div>
          </ScrollArea>

          <DrawerFooter className="pb-8">
            <div className="mb-4">
               <label className="text-xs text-TEXT_SECONDARY uppercase tracking-widest mb-2 block">Promotion Code</label>
               <Input 
                placeholder="กรอกรหัสส่วนลด..." 
                className="bg-white/5 border-white/10 text-white rounded-xl"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
               />
            </div>
            <div className="mb-6">
               <label className="text-xs text-TEXT_SECONDARY uppercase tracking-widest mb-2 block">อีเมลสำหรับใบเสร็จ (ไม่บังคับ)</label>
               <Input 
                placeholder="email@example.com" 
                type="email"
                className="bg-white/5 border-white/10 text-white rounded-xl"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
               />
            </div>
            <div className="flex justify-between items-center mb-6 text-xl font-bold font-display">
                <span className="text-TEXT_SECONDARY">ยอดรวม</span>
                <span className="text-BURNT_ORANGE text-2xl">฿{cartTotal}</span>
            </div>
            <Button size="lg" className="bg-BURNT_ORANGE hover:bg-BURNT_ORANGE/90 text-white rounded-2xl py-7 text-lg font-black shadow-glow" onClick={handleCheckout} disabled={isSubmitting}>
                {isSubmitting ? 'กำลังส่งออเดอร์...' : 'ยืนยันการสั่งซื้อ'}
            </Button>
            <DrawerClose asChild>
              <Button variant="ghost" className="text-TEXT_SECONDARY mt-2">ยังไม่สั่งตอนนี้</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
