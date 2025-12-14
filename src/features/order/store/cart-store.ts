import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MenuOption, OptionGroup } from '@/features/menu/types';

export interface CartItemOption {
    groupName: string;
    optionName: string;
    price: number;
}

export interface CartItem {
    id: string; // Unique ID for this specific line item (e.g. ItemID + OptionHash)
    menuItemId: string;
    name: string;
    price: number; // Base price + Options
    quantity: number;
    image_url?: string;
    selectedOptions: CartItemOption[];
}

interface CartState {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'id'>) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    getTotalPrice: () => number;
    getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (newItem) => {
                const items = get().items;
                // Generate a simple hash/key based on item options to group identical customizations
                // Ideally use a stable stringify or sorting
                const optionsKey = JSON.stringify(newItem.selectedOptions.sort((a,b) => a.groupName.localeCompare(b.groupName)));
                const existingItemIndex = items.findIndex(
                    (i) => i.menuItemId === newItem.menuItemId && 
                    JSON.stringify(i.selectedOptions.sort((a,b) => a.groupName.localeCompare(b.groupName))) === optionsKey
                );

                if (existingItemIndex > -1) {
                    // Update quantity
                    const updatedItems = [...items];
                    updatedItems[existingItemIndex].quantity += newItem.quantity;
                    set({ items: updatedItems });
                } else {
                    // Add new
                    set({ 
                        items: [...items, { ...newItem, id: `${newItem.menuItemId}-${Date.now()}` }] 
                    });
                }
            },
            removeItem: (id) => {
                set({ items: get().items.filter((i) => i.id !== id) });
            },
            updateQuantity: (id, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(id);
                    return;
                }
                set({
                    items: get().items.map((i) => 
                        i.id === id ? { ...i, quantity } : i
                    )
                });
            },
            clearCart: () => set({ items: [] }),
            getTotalPrice: () => {
                return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
            },
            getTotalItems: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0);
            }
        }),
        {
            name: 'tanjaipos-cart',
            // storage defaults to localStorage, which is what we want
        }
    )
);
