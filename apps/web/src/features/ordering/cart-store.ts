import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    options: Record<string, any>;
};

type CartState = {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (menuItemId: string) => void;
    updateQuantity: (menuItemId: string, delta: number) => void;
    clearCart: () => void;
    total: () => number;
};

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (newItem) => {
                const items = get().items;
                const existing = items.find((i) => i.menuItemId === newItem.menuItemId);
                if (existing) {
                    // If already exists, just update quantity
                    set({
                        items: items.map((i) =>
                            i.menuItemId === newItem.menuItemId
                                ? { ...i, quantity: i.quantity + newItem.quantity }
                                : i
                        ),
                    });
                } else {
                    set({ items: [...items, newItem] });
                }
            },
            removeItem: (id) =>
                set((state) => ({ items: state.items.filter((i) => i.menuItemId !== id) })),
            updateQuantity: (id, delta) =>
                set((state) => ({
                    items: state.items
                        .map((item) => {
                            if (item.menuItemId === id) {
                                const newQty = item.quantity + delta;
                                return newQty > 0 ? { ...item, quantity: newQty } : item;
                            }
                            return item;
                        })
                })),
            clearCart: () => set({ items: [] }),
            total: () =>
                get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        }),
        {
            name: 'tanjai-cart-storage',
        }
    )
);
