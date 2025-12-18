'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/lib/database.types';

type Category = Database['public']['Tables']['menu_categories']['Row'];
type MenuItem = Database['public']['Tables']['menu_items']['Row'];
import { TRANSLATIONS, LANGUAGES } from '@/lib/i18n-config';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ViralModal from '@/components/ViralModal';
import { Loader2, Share2 } from 'lucide-react';

export default function MenuPage({ params }: { params: { tenant: string } }) {
  const router = useRouter();
  // Initialize lang based on URL param if it's a valid language code
  const initialLang = LANGUAGES.some(l => l.code === params.tenant)
    ? params.tenant
    : 'th';

  const [lang, setLang] = useState(initialLang);
  const [isMember, setIsMember] = useState(false);
  
  // State for Data
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // State for Cart
  const [cart, setCart] = useState<{id: string, price: number}[]>([]);
  
  // State for Viral Modal
  const [viralItem, setViralItem] = useState<MenuItem | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
        setLoading(true);
        // Get Restaurant by Slug (from params.tenant)
        // Mock Client handles 'tanjai' slug
        
        const { data: cats } = await supabase.from('menu_categories').select('*').order('sort_order');
        if (cats) {
            setCategories(cats);
        }

        const { data: menuItems } = await supabase.from('menu_items').select('*').eq('is_available', true);
        if (menuItems) setItems(menuItems);

        setLoading(false);
    }
    loadData();

    // Cart Load
    const saved = localStorage.getItem('guest_cart');
    if (saved) {
      try { setCart(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('guest_cart', JSON.stringify(cart));
  }, [cart]);

  const t = TRANSLATIONS[lang as keyof typeof TRANSLATIONS];
  const currentFont = LANGUAGES.find(l => l.code === lang)?.font || 'font-sans';

  const handleMemberLogin = () => { window.location.href = '/login'; };

  const addToCart = (item: MenuItem) => {
     setCart(prev => [...prev, { id: item.id, price: item.price }]);
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const count = cart.length;

  const filteredItems = activeCategory === 'all' 
    ? items 
    : items.filter(i => i.category_id === activeCategory);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className={`min-h-screen bg-gray-50 pb-24 ${currentFont}`}>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white shadow-sm px-4 py-3">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-xl font-bold text-gray-800">{t.title}</h1>
          <div className="flex items-center gap-2">
             {!isMember ? (
                <button 
                  onClick={handleMemberLogin}
                  className="text-xs font-bold bg-gray-900 text-white px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm"
                >
                  Login
                </button>
             ) : (
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-100">Member</span>
             )}
          </div>
        </div>
        <LanguageSwitcher 
            currentLang={lang} 
            onLanguageChange={(newLang) => {
                setLang(newLang);
                router.push(`/${newLang}`);
            }} 
        />
        
        {/* Category Tabs */}
        <div role="tablist" className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
             <button
                role="tab"
                aria-selected={activeCategory === 'all'}
                onClick={() => setActiveCategory('all')}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                    activeCategory === 'all' 
                    ? 'bg-orange-500 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
                {t.category_all}
            </button>
            {categories.map(cat => (
                <button
                    key={cat.id}
                    role="tab"
                    aria-selected={activeCategory === cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                        activeCategory === cat.id 
                        ? 'bg-orange-500 text-white shadow-md' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    {cat.name}
                </button>
            ))}
        </div>
      </header>

      {/* Menu Grid */}
      <main className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <div 
            key={item.id} 
            className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 active:scale-95 transition-transform duration-100 group relative"
          >
            <button 
              onClick={() => setViralItem(item)}
              className="absolute top-2 right-2 z-10 bg-white/80 backdrop-blur-sm p-1.5 rounded-full text-gray-600 shadow-sm opacity-100 md:opacity-0 group-hover:opacity-100 transition-all"
              aria-label={t.share || "Share"}
              title={t.share || "Share"}
            >
               <Share2 size={16} />
            </button>

            <div className="relative h-32 w-full bg-gray-200">
               {/* Use a placeholder if image fails in dry run */}
               {item.image_url && <Image src={item.image_url} alt={item.name} fill className="object-cover" unoptimized />} 
               {!item.image_url && <div className="absolute inset-0 flex items-center justify-center text-gray-400">No Image</div>}
            </div>

            <div className="p-3">
              <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1 truncate">
                {item.name}
              </h3>
              
              <div className="flex justify-between items-center mt-2">
                <span className="text-orange-600 font-bold text-lg">
                  {item.price} <span className="text-xs">{t.currency}</span>
                </span>
                <button 
                  onClick={() => addToCart(item)}
                  className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 shadow-sm"
                  aria-label={t.addToCart}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* Floating Cart Bar (Visible if items in cart) */}
      {count > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg safe-area-bottom">
            <button className="w-full bg-gray-900 text-white font-bold py-3 px-4 rounded-xl flex justify-between items-center shadow-xl active:scale-95 transition-all">
                <div className="flex items-center gap-2">
                    <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">{count} {t.items}</span>
                </div>
                <span className="text-lg">{t.checkout} • {total} {t.currency}</span>
            </button>
        </div>
      )}

      {/* Viral Modal */}
      {viralItem && (
        <ViralModal item={viralItem} onClose={() => setViralItem(null)} />
      )}
    </div>
  );
}
