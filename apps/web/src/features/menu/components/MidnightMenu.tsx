'use client';

import { useMemo, useEffect, useState, useRef } from 'react';
import { HeroCard } from '@/components/menu/HeroCard';
import { CategoryNav } from '@/components/menu/CategoryNav'; // We will need to update this to accept props
import { ProductCard } from '@/components/menu/ProductCard';
import { ProductListItem } from '@/components/menu/ProductListItem';
import { useCartStore } from '@/features/ordering/cart-store';
import { Category } from '@/features/ordering/components/menu-grid'; // Type re-use
import { toast } from 'sonner';

interface MidnightMenuProps {
  categories: Category[];
}

export const MidnightMenu = ({ categories }: MidnightMenuProps) => {
  const { addItem } = useCartStore();
  const [activeCategory, setActiveCategory] = useState<string>('');
  
  // Ref for scroll spy
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // 1. Hero Selection Logic
  const heroItem = useMemo(() => {
    // Try to find a "Chef's Special" or "Recommended" category
    const specialCat = categories.find(c => 
      c.name.toLowerCase().includes('recommend') || 
      c.name.toLowerCase().includes('special') ||
      c.name.toLowerCase().includes('signature')
    );

    if (specialCat && specialCat.menu_items.length > 0) {
        return {
            ...specialCat.menu_items[0],
            badgeText: "Chef's Special"
        };
    }

    // Fallback: Pick the most expensive item across all categories
    let maxPriceItem = null;
    let maxPrice = 0;

    categories.forEach(cat => {
        cat.menu_items.forEach(item => {
            if (item.price > maxPrice && item.image_url) {
                maxPrice = item.price;
                maxPriceItem = item;
            }
        });
    });

    return maxPriceItem ? { ...maxPriceItem, badgeText: "Premium Selection" } : null;
  }, [categories]);


  // 2. Scroll Spy Logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -50% 0px' } 
    );

    Object.values(categoryRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [categories]);
  
  const handleAddToCart = (item: any) => {
      addItem({
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          options: [] // Default no options for now
      });
      toast.success(`Added ${item.name} to warmth`);
  };

  const scrollToCategory = (id: string) => {
      const el = document.getElementById(id);
      if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 140; // Offset for sticky header + nav
          window.scrollTo({ top: y, behavior: 'smooth' });
      }
  };


  if (!categories || categories.length === 0) return <div className="p-8 text-center text-gray-500">Menu is preparing...</div>;

  return (
    <>
        {/* Navigation - passed props for interactivity */}
        <NavWrapper 
            categories={categories} 
            activeId={activeCategory} 
            onSelect={scrollToCategory} 
        />

        {/* Hero Section */}
        {heroItem && (
            <HeroCard 
                title={heroItem.name}
                description={heroItem.description || ''}
                price={heroItem.price}
                imageUrl={heroItem.image_url || '/placeholder.jpg'}
                badgeText={heroItem.badgeText}
            />
        )}

        {/* Menu Sections */}
        {categories.map((cat) => {
            const isNoodle = cat.name.toLowerCase().includes('ramen') || cat.name.toLowerCase().includes('noodle');

            return (
                <section 
                    key={cat.id} 
                    id={cat.id} 
                    ref={(el: HTMLDivElement | null) => { if (el) categoryRefs.current[cat.id] = el; }} 
                    className="mb-8 scroll-mt-32"
                >
                    <div className="flex items-center justify-between px-4 mb-4">
                        <h3 className="text-white text-lg font-bold tracking-tight font-display">{cat.name}</h3>
                    </div>
                    
                    {isNoodle ? (
                        <div className="flex flex-col gap-4 px-4">
                            {cat.menu_items.map(item => (
                                <ProductListItem 
                                    key={item.id} 
                                    {...item} 
                                    imageUrl={item.image_url}
                                    onAdd={() => handleAddToCart(item)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 px-4">
                            {cat.menu_items.map(item => (
                                <ProductCard 
                                    key={item.id} 
                                    {...item} 
                                    imageUrl={item.image_url}
                                    onAdd={() => handleAddToCart(item)}
                                />
                            ))}
                        </div>
                    )}
                </section>
            );
        })}
    </>
  );
};

// Internal component to wrap CategoryNav with logic
const NavWrapper = ({ categories, activeId, onSelect }: any) => {
    return (
        <div className="sticky top-[72px] z-20 bg-[#121212]/95 backdrop-blur-sm pt-2 pb-4">
            <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar snap-x">
                {categories.map((cat: any) => (
                    <button 
                        key={cat.id}
                        onClick={() => onSelect(cat.id)}
                        className={`snap-start shrink-0 px-5 py-2 rounded-full text-sm font-medium leading-normal transition-all active:scale-95 
                            ${activeId === cat.id
                                ? 'bg-primary shadow-glow border border-primary/50 text-white font-bold' 
                                : 'bg-[#1E1E1E]/60 backdrop-blur-md border border-white/5 text-[#E0E0E0] hover:bg-white/10'
                            }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>
        </div>
    );
}
