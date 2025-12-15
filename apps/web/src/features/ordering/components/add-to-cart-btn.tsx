'use client';

import { useCartStore } from '@/features/ordering/cart-store';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function AddToCartBtn({ item }: { item: any }) {
    const addItem = useCartStore((state) => state.addItem);

    const handleAdd = () => {
        if (item.stock !== undefined && item.stock <= 0) {
            toast.error('Out of Stock');
            return;
        }

        addItem({
            menuItemId: item.id,
            name: item.name,
            price: item.price,
            quantity: 1,
            options: {}
        });
        // In a real app we'd need a Toaster provider
        console.log('Added to cart', item.name);
        // toast.success(`Added ${item.name}`); 
    };

    const isOutOfStock = item.stock !== undefined && item.stock <= 0;

    return (
        <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`p-2 rounded-full absolute bottom-4 right-4 shadow-lg transition-all ${isOutOfStock ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 text-white hover:bg-orange-600 active:scale-90'}`}
        >
            <Plus className="w-5 h-5" />
        </button>
    );
}
