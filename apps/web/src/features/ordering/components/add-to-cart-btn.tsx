'use client';

import { useCartStore } from '@/features/ordering/cart-store';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function AddToCartBtn({ item }: { item: any }) {
    const addItem = useCartStore((state) => state.addItem);

    const handleAdd = () => {
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

    return (
        <button
            onClick={handleAdd}
            className="bg-orange-500 text-white p-2 rounded-full absolute bottom-4 right-4 shadow-lg hover:bg-orange-600 active:scale-90 transition-all"
        >
            <Plus className="w-5 h-5" />
        </button>
    );
}
