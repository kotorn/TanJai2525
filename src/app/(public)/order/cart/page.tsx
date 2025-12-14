"use client";

import { useCartStore } from "@/features/order/store/cart-store";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { submitOrder } from "@/features/order/actions";
import { toast } from "sonner";

export default function CartPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const tableId = searchParams.get("tableId");

    const items = useCartStore(state => state.items);
    const updateQuantity = useCartStore(state => state.updateQuantity);
    const removeItem = useCartStore(state => state.removeItem);
    const clearCart = useCartStore(state => state.clearCart);
    const getTotalPrice = useCartStore(state => state.getTotalPrice);
    
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (items.length === 0) {
        return (
             <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                 <h1 className="text-xl font-bold text-gray-900 mb-2">Cart is empty</h1>
                 <p className="text-gray-500 mb-6">You haven't added any items yet.</p>
                 <Link href={`/order?tableId=${tableId}`}>
                    <Button>Back to Menu</Button>
                 </Link>
             </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            {/* Header */}
            <div className="bg-white p-4 sticky top-0 z-10 shadow-sm flex items-center gap-4">
                <Link href={`/order?tableId=${tableId}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="size-5" />
                    </Button>
                </Link>
                <h1 className="font-bold text-lg">Review Order</h1>
            </div>

            <div className="p-4 space-y-4">
                {items.map(item => (
                    <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-2">
                             <div>
                                <h3 className="font-bold text-gray-900">{item.name}</h3>
                                <div className="text-sm text-gray-500 mt-1 space-y-1">
                                    {item.selectedOptions.map((opt, i) => (
                                        <div key={i}>
                                            + {opt.optionName} {opt.price > 0 && `(฿${opt.price})`}
                                        </div>
                                    ))}
                                    {item.selectedOptions.length === 0 && <span className="italic text-xs">No options</span>}
                                </div>
                             </div>
                             <div className="font-bold text-orange-600">
                                 ฿{item.price * item.quantity}
                             </div>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                             <div className="flex items-center gap-3">
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-8 w-8 rounded-full"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                    {item.quantity === 1 ? <Trash2 className="size-3 text-red-500" /> : <Minus className="size-3" />}
                                </Button>
                                <span className="font-bold w-4 text-center">{item.quantity}</span>
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-8 w-8 rounded-full"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                    <Plus className="size-3" />
                                </Button>
                             </div>
                             <div className="text-xs text-gray-400">
                                 ฿{item.price} / unit
                             </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Sticky Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-center mb-4 text-lg">
                    <span className="text-gray-500">Total</span>
                    <span className="font-bold text-2xl">฿{getTotalPrice()}</span>
                </div>
                <Button 
                    className="w-full h-12 text-lg font-bold bg-green-600 hover:bg-green-700" 
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Placing Order..." : "Place Order"}
                </Button>
            </div>
        </div>
    );
}
