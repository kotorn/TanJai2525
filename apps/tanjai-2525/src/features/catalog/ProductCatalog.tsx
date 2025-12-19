'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { ProductCard } from './ProductCard';
import { Skeleton } from '@tanjai/ui';
import { useTranslations } from 'next-intl';
import { useCart } from '@/features/cart/CartContext';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  category_id?: string;
  stock_quantity?: number; // Added stock_quantity
}

export function ProductCatalog() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const t = useTranslations();
  const supabase = createClient();
  const { addItem } = useCart();

  useEffect(() => {
    async function fetchItems() {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .order('name');

        if (error) throw error;
        setItems(data || []);
      } catch (error) {
        console.error('Error fetching menu items:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, []);

  // Extract unique categories
  const categories = Array.from(new Set(items.map(item => item.category_id).filter(Boolean)));
  
  const filteredItems = selectedCategory 
    ? items.filter(item => item.category_id === selectedCategory)
    : items;

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      imageUrl: item.image_url,
    });
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4 pb-24">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-8 w-20 rounded-full bg-zinc-800 shrink-0" />)}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl bg-zinc-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 pb-24">
      {/* Category Bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4 sticky top-[72px] bg-zinc-950 z-10 py-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            selectedCategory === null 
              ? 'bg-amber-600 text-white' 
              : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
          }`}
        >
          {t('catalog.all')}
        </button>
        {categories.map((catId) => (
          <button
            key={catId}
            onClick={() => setSelectedCategory(catId!)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === catId 
                ? 'bg-amber-600 text-white' 
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
            }`}
          >
            {/* Using ID as name since we don't have category names yet */}
            Category {catId?.substring(0, 4)}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white uppercase tracking-wider">
          {t('catalog.title')}
        </h2>
        <span className="text-zinc-500 text-xs">{filteredItems.length} items</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <ProductCard
            key={item.id}
            id={item.id}
            name={item.name}
            price={item.price}
            description={item.description}
            imageUrl={item.image_url}
            isAvailable={item.is_available}
            onAddToCart={() => handleAddToCart(item)}
          />
        ))}
      </div>
    </div>
  );
}
