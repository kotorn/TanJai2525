"use client";

import { useCartStore, CartItem } from "../store/cart-store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { submitOrder } from "../actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CartDrawerProps {
  tableId?: string;
  className?: string;
}

export function CartDrawer({ tableId, className }: CartDrawerProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice());
  const getTotalItems = useCartStore((state) => state.getTotalItems());

  const handlePlaceOrder = async () => {
    if (!tableId) {
      toast.error("Invalid session (missing table)");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitOrder(tableId, items);

      if (result.success) {
        clearCart();
        setIsOpen(false);
        router.push(`/order/success?tableId=${tableId}`);
      } else {
        toast.error(result.error || "Failed to place order");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          className={cn(
            "fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg z-50",
            "bg-orange-600 hover:bg-orange-700 text-white",
            getTotalItems === 0 && "hidden",
            className
          )}
        >
          <ShoppingBag className="h-6 w-6" />
          {getTotalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {getTotalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="text-xl font-bold">
            Your Cart ({getTotalItems} items)
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Your cart is empty
            </h3>
            <p className="text-gray-500 text-sm">
              Add items from the menu to get started
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6">
              <div className="py-4 space-y-4">
                {items.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            </ScrollArea>

            <div className="border-t px-6 py-4 space-y-4 bg-gray-50">
              <div className="flex justify-between items-center text-lg">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-bold text-2xl">฿{getTotalPrice.toFixed(2)}</span>
              </div>
              <Button
                className="w-full h-12 text-base font-bold bg-green-600 hover:bg-green-700"
                onClick={handlePlaceOrder}
                disabled={isSubmitting || !tableId}
              >
                {isSubmitting ? "Placing Order..." : "Place Order"}
              </Button>
              {!tableId && (
                <p className="text-xs text-red-500 text-center">
                  No table selected
                </p>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

function CartItemCard({ item, onUpdateQuantity, onRemove }: CartItemCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-bold text-gray-900">{item.name}</h4>
          {item.selectedOptions.length > 0 && (
            <div className="mt-2 space-y-1">
              {item.selectedOptions.map((opt, i) => (
                <div key={i} className="text-xs text-gray-500">
                  + {opt.optionName}{" "}
                  {opt.price > 0 && <span>(฿{opt.price})</span>}
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => onRemove(item.id)}
          className="text-red-500 hover:text-red-700 ml-2 p-1"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="font-bold w-8 text-center">{item.quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        <div className="text-right">
          <div className="font-bold text-orange-600">
            ฿{(item.price * item.quantity).toFixed(2)}
          </div>
          <div className="text-xs text-gray-400">฿{item.price} each</div>
        </div>
      </div>
    </div>
  );
}
