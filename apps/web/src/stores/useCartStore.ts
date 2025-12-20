import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  options?: Record<string, any>;
  imageUrl?: string;
}

interface CartStore {
  items: CartItem[];

  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;

  // Computed
  totalItems: () => number;
  totalPrice: () => number;

  // UTM Tracking
  utmSource: string | null;
  utmMedium: string | null;
  setUTM: (source: string | null, medium: string | null) => void;

  // Sync with Supabase (for logged-in users)
  syncWithDatabase: () => Promise<void>;
  loadFromDatabase: () => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.menuItemId === item.menuItemId &&
              JSON.stringify(i.options) === JSON.stringify(item.options)
          );

          if (existingItem) {
            // Update quantity if item exists
            return {
              items: state.items.map((i) =>
                i.menuItemId === item.menuItemId &&
                  JSON.stringify(i.options) === JSON.stringify(item.options)
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }

          // Add new item
          return { items: [...state.items, item] };
        });
      },

      removeItem: (menuItemId) => {
        set((state) => ({
          items: state.items.filter((i) => i.menuItemId !== menuItemId),
        }));
      },

      updateQuantity: (menuItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId);
          return;
        }

        set((state) => ({
          items: state.items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      totalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      totalPrice: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },

      utmSource: null,
      utmMedium: null,
      setUTM: (source, medium) => {
        set({ utmSource: source, utmMedium: medium });
      },

      syncWithDatabase: async () => {
        // TODO: Implement Supabase sync for logged-in users
        console.log('Syncing cart with database...');
      },

      loadFromDatabase: async () => {
        // TODO: Implement loading cart from Supabase
        console.log('Loading cart from database...');
      },
    }),
    {
      name: 'tanjai-cart-storage', // LocalStorage key
      storage: createJSONStorage(() => localStorage),
    }
  )
);
