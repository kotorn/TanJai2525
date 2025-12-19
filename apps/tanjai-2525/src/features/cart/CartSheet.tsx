'use client';

import { useCart } from './CartContext';
import { useTranslations } from 'next-intl';
import { Button, ScrollArea, Separator } from '@tanjai/ui';
import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export function CartSheet() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/order/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'tanjai_secret_internal_key_2025',
        },
        body: JSON.stringify({
          restaurantId: '61b1c93e-ae38-4244-85ef-0f263d2b614b',
          tableId: 'POS-1',
          items: items.map(item => ({
            menuItemId: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            category: 'Main Course'
          }))
        }),
      });

      const result = await response.json();
      if (result.success) {
        clearCart();
        router.push(`/${locale}/order-success`);
      } else {
        alert('Failed to submit order: ' + result.error);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (totalItems === 0 && !isOpen) return null;

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xs px-4 z-40 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button
            onClick={() => setIsOpen(true)}
            className="w-full bg-white text-black font-black py-4 rounded-2xl shadow-2xl flex items-center justify-between px-6 active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 bg-amber-500 text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white">
                  {totalItems}
                </span>
              </div>
              <span className="text-sm uppercase tracking-tighter">View Cart</span>
            </div>
            <span className="font-bold text-lg">฿{totalPrice.toLocaleString()}</span>
          </button>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Bottom Sheet */}
      <div 
        className={`fixed inset-x-0 bottom-0 z-50 bg-zinc-950 border-t border-zinc-800 rounded-t-[32px] transition-transform duration-500 ease-out transform ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '85vh' }}
      >
        <div className="flex flex-col h-full max-h-[85vh]">
          {/* Header */}
          <div className="p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">{t('cart.title') || 'Your Cart'}</h2>
              <p className="text-zinc-500 text-sm">{totalItems} items</p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <Separator className="bg-zinc-800" />

          {/* Items List */}
          <ScrollArea className="flex-1 px-6 py-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <ShoppingCart className="w-16 h-16 text-zinc-800 mb-4" />
                <p className="text-zinc-500 italic">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-zinc-900 rounded-xl overflow-hidden shrink-0 border border-zinc-800">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-700">
                          <ShoppingCart className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-bold truncate">{item.name}</h4>
                      <p className="text-amber-500 font-bold text-sm">฿{item.price.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-zinc-900 rounded-xl p-1 border border-zinc-800">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 text-zinc-400 hover:text-white transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-white font-bold min-w-[20px] text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 text-zinc-400 hover:text-white transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <Separator className="bg-zinc-800" />

          {/* Footer */}
          <div className="p-6 bg-zinc-900/50 space-y-4 pb-10">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 font-medium">Total Amount</span>
              <span className="text-2xl font-black text-white">฿{totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white h-12 rounded-xl"
                onClick={clearCart}
                disabled={isSubmitting}
              >
                Clear
              </Button>
              <Button 
                className="flex-[2] bg-amber-600 hover:bg-amber-500 text-white font-black h-12 rounded-xl"
                disabled={items.length === 0 || isSubmitting}
                onClick={handleCheckout}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  'Checkout'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
