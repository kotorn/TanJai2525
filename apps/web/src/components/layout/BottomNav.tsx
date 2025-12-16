'use client';

import { useCartStore } from '@/features/ordering/cart-store';
import { useState } from 'react';
import { CartDrawer } from '@/features/ordering/components/cart-drawer';

interface BottomNavProps {
    restaurantId: string;
    tableId: string;
}

export const BottomNav = ({ restaurantId, tableId }: BottomNavProps) => {
    const { items } = useCartStore();
    const [isCartOpen, setIsCartOpen] = useState(false);
    
    const cartCount = items.reduce((acc, i) => acc + i.quantity, 0);

    return (
        <>
            <nav className="fixed bottom-0 z-40 w-full max-w-md mx-auto left-0 right-0 bg-[#121212]/85 backdrop-blur-2xl border-t border-white/5">
                <div className="flex justify-around items-center h-20 px-2 pb-2">
                    <a className="flex flex-col items-center justify-center w-full h-full gap-1 text-gray-400 hover:text-white transition-colors" href="#">
                        <span className="material-symbols-outlined text-[24px]">home</span>
                        <span className="text-[10px] font-medium">Home</span>
                    </a>
                    
                    {/* Active Menu Tab */}
                    <a className="flex flex-col items-center justify-center w-full h-full gap-1 text-primary cursor-default">
                        <div className="bg-primary/20 px-4 py-1 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-[24px] text-primary">restaurant_menu</span>
                        </div>
                        <span className="text-[10px] font-bold text-primary">Menu</span>
                    </a>

                    {/* Cart Trigger */}
                    <div 
                        className="relative flex flex-col items-center justify-center w-full h-full gap-1 text-gray-400 hover:text-white transition-colors group cursor-pointer"
                        onClick={() => setIsCartOpen(true)}
                    >
                        {/* Cart Badge */}
                        {cartCount > 0 && (
                            <div className="absolute top-4 right-6 size-4 bg-secondary rounded-full shadow-[0_0_8px_rgba(255,179,0,0.6)] animate-pulse flex items-center justify-center text-[10px] text-black font-bold">
                                {cartCount}
                            </div>
                        )}
                        <span className="material-symbols-outlined text-[24px] group-hover:scale-110 transition-transform">shopping_bag</span>
                        <span className="text-[10px] font-medium">Orders</span>
                    </div>

                    <a className="flex flex-col items-center justify-center w-full h-full gap-1 text-gray-400 hover:text-white transition-colors" href="#">
                        <span className="material-symbols-outlined text-[24px]">person</span>
                        <span className="text-[10px] font-medium">Profile</span>
                    </a>
                </div>
            </nav>

            {/* Invisible Cart Drawer Trigger Logic - We override the default trigger of CartDrawer if needed or just use it controlled */}
            {/* The existing CartDrawer has its own trigger button but controls isOpen internally via props? Let's check CartDrawer content again.
               Result: CartDrawer has `isOpen` state internal. We might need to refactor CartDrawer to be controlled OR wrap it differently.
               For this iteration, let's try to pass a controlled prop if possible, or edit CartDrawer to accept `open` prop.
               Wait, existing CartDrawer has `open={isOpen} onOpenChange={setIsOpen}` on the Drawer component. 
               We should modify CartDrawer to accept props or expose a way to open it. 
               Let's modify CartDrawer to accept `controlledOpen` and `setControlledOpen`.
            */}
             <CartDrawerController isOpen={isCartOpen} setIsOpen={setIsCartOpen} restaurantId={restaurantId} tableId={tableId} />
        </>
    );
};

// Wrapper to adapt the existing CartDrawer without breaking changes if we don't want to rewrite it fully yet. 
// Actually, checking CartDrawer code... it has local state. 
// We should modify CartDrawer to be controlled.
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@tanjai/ui";
import { Button } from "@tanjai/ui";
import { ScrollArea } from "@tanjai/ui";
import { Minus, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const CartDrawerController = ({ isOpen, setIsOpen, restaurantId, tableId }: any) => {
     const { items, removeItem, updateQuantity, total, clearCart } = useCartStore();
     const cartTotal = total();
     const [isSubmitting, setIsSubmitting] = useState(false);

     const handleCheckout = async () => {
         // Mock Checkout
         setIsSubmitting(true);
         setTimeout(() => {
             setIsSubmitting(false);
             clearCart();
             setIsOpen(false);
             toast.success("Order send to kitchen!");
         }, 1000);
     };

     return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerContent className="bg-[#1E1E1E] border-t border-white/10 text-[#E0E0E0]">
            <div className="mx-auto w-full max-w-sm">
              <DrawerHeader>
                <DrawerTitle className="text-white">Your Order</DrawerTitle>
              </DrawerHeader>
              
              <ScrollArea className="h-[50vh] p-4">
                <div className="flex flex-col gap-4">
                    {items.length === 0 ? (
                        <div className="text-center text-gray-500 py-10">Basket is empty</div>
                    ) : (
                        items.map((item) => (
                            <div key={item.menuItemId} className="flex justify-between items-center border-b border-white/5 pb-4 last:border-0">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-white">{item.name}</h4>
                                    <p className="text-sm text-secondary">฿{item.price * item.quantity}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                     <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white" onClick={() => updateQuantity(item.menuItemId, -1)}>
                                        <Minus className="h-3 w-3" />
                                     </Button>
                                     <span className="w-4 text-center text-sm font-bold">{item.quantity}</span>
                                     <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white" onClick={() => updateQuantity(item.menuItemId, 1)}>
                                        <Plus className="h-3 w-3" />
                                     </Button>
                                     <Button variant="destructive" size="icon" className="h-8 w-8 ml-2 opacity-80 hover:opacity-100" onClick={() => removeItem(item.menuItemId)}>
                                        <Trash2 className="h-3 w-3" />
                                     </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
              </ScrollArea>
    
              <DrawerFooter>
                {items.length > 0 && (
                    <div className="flex justify-between items-center mb-4 text-lg font-bold text-white">
                        <span>Total</span>
                        <span className="text-primary">฿{cartTotal}</span>
                    </div>
                )}
                <Button 
                    size="lg" 
                    onClick={handleCheckout} 
                    disabled={isSubmitting || items.length === 0}
                    className="w-full bg-primary text-white hover:bg-primary/90"
                >
                    {isSubmitting ? 'Sending...' : 'Confirm Order'}
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline" className="border-white/10 text-gray-400 hover:bg-white/5 hover:text-white">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
     );
}
