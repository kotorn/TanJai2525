import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    options: Record<string, any>;
    // [NEW] Tax Fields
    taxRate: number; // 0.08 or 0.10
    isAlcohol: boolean;
};

type TaxBreakdown = {
    total8: number;       // Gross Total for 8% items
    total10: number;      // Gross Total for 10% items
    taxAmount8: number;   // Tax component of total8
    taxAmount10: number;  // Tax component of total10
    grandTotal: number;
};

type CartState = {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (menuItemId: string) => void;
    updateQuantity: (menuItemId: string, delta: number) => void;
    clearCart: () => void;
    total: () => number;
    getTaxBreakdown: () => TaxBreakdown;
};

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (newItem) => {
                const items = get().items;
                const existing = items.find((i) => i.menuItemId === newItem.menuItemId);
                if (existing) {
                    // Update quantity
                    set({
                        items: items.map((i) =>
                            i.menuItemId === newItem.menuItemId
                                ? { ...i, quantity: i.quantity + newItem.quantity }
                                : i
                        ),
                    });
                } else {
                    // Default tax rate if not provided (Safety fallback)
                    const itemWithTax = {
                        ...newItem,
                        taxRate: newItem.taxRate ?? (newItem.isAlcohol ? 0.10 : 0.08)
                    };
                    set({ items: [...items, itemWithTax] });
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
            
            getTaxBreakdown: () => {
                const items = get().items;
                let total8 = 0;
                let total10 = 0;

                items.forEach(item => {
                    const lineTotal = item.price * item.quantity;
                    // Check tax rate. Comparison with epsilon for float safety, or just direct for now
                    if (item.taxRate >= 0.09) { // Treat anything near 10% as 10%
                        total10 += lineTotal;
                    } else {
                        total8 += lineTotal;
                    }
                });

                // Tax Calculation (Inclusive Tax)
                // Tax = Price - (Price / (1 + Rate))
                const taxAmount8 = total8 - (total8 / 1.08);
                const taxAmount10 = total10 - (total10 / 1.10);

                return {
                    total8,
                    total10,
                    taxAmount8,
                    taxAmount10,
                    grandTotal: total8 + total10
                };
            }
        }),
        {
            name: 'tanjai-cart-storage',
        }
    )
);
