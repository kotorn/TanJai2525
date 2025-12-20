'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/lib/database.types';

type Category = Database['public']['Tables']['menu_categories']['Row'];
type MenuItem = Database['public']['Tables']['menu_items']['Row'];
import { TRANSLATIONS, LANGUAGES } from '@/lib/i18n-config';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import nextDynamic from 'next/dynamic';
const ViralModal = nextDynamic(() => import('@/components/ViralModal'), { ssr: false });
import { Skeleton } from '@tanjai/ui';
import { Loader2, Share2, ShoppingBasket, Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { CartDrawer } from '@/features/ordering/components/cart-drawer';
import { SafeImage } from '@tanjai/ui';

function MenuPageContent({ params }: { params: { tenant: string } }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isKiosk = searchParams.get('mode') === 'kiosk';

  // Initialize lang based on Query Param (Priority) > URL Param (Legacy) > Default
  const currentLang = searchParams.get('lang') ||
    (LANGUAGES.some(l => l.code === params.tenant) ? params.tenant : 'th');

  const [lang, setLang] = useState(currentLang);

  // Update effect to sync state if URL changes externally
  useEffect(() => {
    const urlLang = searchParams.get('lang');
    if (urlLang && LANGUAGES.some(l => l.code === urlLang)) {
      setLang(urlLang);
    }
  }, [searchParams]);
  const [isMember, setIsMember] = useState(false);

  // State for Data
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // State for Cart
  const [cart, setCart] = useState<{ id: string, price: number }[]>([]);

  // State for Hero Item
  const [heroItem, setHeroItem] = useState<MenuItem | null>(null);

  // State for Viral Modal
  const [viralItem, setViralItem] = useState<MenuItem | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const { data: cats, error: catErr } = await supabase.from('menu_categories').select('*').order('sort_order');
        if (catErr) throw catErr;
        if (cats) setCategories(cats);

        const { data: menuItems, error: itemsErr } = await supabase.from('menu_items').select('*').eq('is_available', true);
        if (itemsErr) throw itemsErr;
        if (menuItems) {
          setItems(menuItems);
          // Set the first item with an image as hero if none exists
          const featured = menuItems.find(i => i.image_url);
          if (featured) setHeroItem(featured);
        }
      } catch (err: any) {
        console.error('Error loading menu:', err);
        setError(err.message || 'Failed to load menu data');
        toast.error('Could not load menu. Please try again.');
      } finally {
        setLoading(false);
      }
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

  // 1. Dynamic Greeting Logic
  const [greeting, setGreeting] = useState('');
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  // 2. Kiosk Idle Timer
  useEffect(() => {
    if (!isKiosk) return;

    let timer: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        console.log('[Kiosk] Idle timeout reached. Resetting...');
        setCart([]); // Clear cart
        setActiveCategory('all');
        toast.info('Session reset due to inactivity');
      }, 60000); // 60 seconds
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    window.addEventListener('click', resetTimer);

    resetTimer();

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
      window.removeEventListener('click', resetTimer);
      clearTimeout(timer);
    };
  }, [isKiosk]);

  const t = TRANSLATIONS[lang as keyof typeof TRANSLATIONS];
  const currentFont = LANGUAGES.find(l => l.code === lang)?.font || 'font-sans';


  const handleMemberLogin = () => { window.location.href = '/login'; };

  const addToCart = (item: MenuItem) => {
    setCart(prev => [...prev, { id: item.id, price: item.price }]);
    toast.success(`เพิ่ม ${item.name} ลงในตะกร้าแล้ว`);
  };

  const filteredItems = activeCategory === 'all'
    ? items
    : items.filter(i => i.category_id === activeCategory);

  // --- Specialized UI Components ---
  const MenuSkeleton = () => (
    <div className="px-4 pb-12 grid grid-cols-2 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="glass-panel rounded-[2rem] overflow-hidden flex flex-col h-64">
          <Skeleton className="h-36 w-full opacity-20" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-3/4 opacity-20" />
            <Skeleton className="h-3 w-1/2 opacity-10" />
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-6 w-12 opacity-20" />
              <Skeleton className="h-10 w-10 rounded-2xl opacity-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const ErrorDisplay = () => (
    <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh]">
      <div className="bg-red-500/10 p-4 rounded-full mb-4">
        <AlertCircle className="text-red-500 w-12 h-12" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Oops! Something went wrong</h2>
      <p className="text-TEXT_SECONDARY mb-6 max-w-xs">{error || 'We had trouble loading the menu. Please check your connection.'}</p>
      <button
        onClick={() => window.location.reload()}
        className="flex items-center gap-2 bg-BURNT_ORANGE text-white px-6 py-2 rounded-full font-bold active:scale-95 transition-all shadow-glow"
      >
        <RefreshCw size={18} /> Retry
      </button>
    </div>
  );

  const EmptyState = () => (
    <div className="col-span-2 flex flex-col items-center justify-center p-12 text-center h-64 opacity-60">
      <div className="bg-white/5 p-6 rounded-full mb-4">
        <ShoppingBasket className="text-TEXT_MUTED w-12 h-12" />
      </div>
      <h3 className="text-lg font-bold text-white mb-1">No items found</h3>
      <p className="text-xs text-TEXT_SECONDARY">Try checking a different category.</p>
    </div>
  );

  return (
    <div className={`min-h-screen bg-[#121212] text-[#E0E0E0] pb-32 ${currentFont} font-body overflow-x-hidden ${isKiosk ? 'kiosk-mode' : ''}`}>
      {/* 1. Sticky Glass Header */}
      {!isKiosk && (
        <header className="sticky top-0 z-40 glass-nav px-4 py-4 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-xs text-TEXT_SECONDARY font-medium">{greeting}, Guest</span>
              <div className="flex items-center gap-1">
                <h1 className="text-lg font-black font-display text-white tracking-tight">{t.title} (v2)</h1>
                <div className="w-1.5 h-1.5 rounded-full bg-BURNT_ORANGE animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher
                currentLang={lang}
                onLanguageChange={(newLang) => {
                  setLang(newLang);
                  router.push(`${pathname}?lang=${newLang}`);
                }}
              />
              <button onClick={handleMemberLogin} className="glass-panel p-2 rounded-xl text-white active:scale-95 transition-all">
                <Loader2 size={18} className={isMember ? "text-green-500" : "text-white"} />
              </button>
            </div>
          </div>

          {/* 2. Category Scroll (Horizontal Snap) */}
          <div role="tablist" className="flex gap-2 overflow-x-auto no-scrollbar snap-x pb-1">
            <button
              role="tab"
              aria-selected={activeCategory === 'all' ? "true" : "false"}
              onClick={() => setActiveCategory('all')}
              className={`snap-start whitespace-nowrap px-5 py-2 rounded-full text-xs font-bold transition-all ${activeCategory === 'all'
                ? 'bg-BURNT_ORANGE text-white shadow-glow'
                : 'bg-white/5 text-TEXT_SECONDARY border border-white/5 hover:bg-white/10'
                }`}
            >
              {t.category_all}
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                role="tab"
                aria-selected={activeCategory === cat.id ? "true" : "false"}
                onClick={() => setActiveCategory(cat.id)}
                className={`snap-start whitespace-nowrap px-5 py-2 rounded-full text-xs font-bold transition-all ${activeCategory === cat.id
                  ? 'bg-BURNT_ORANGE text-white shadow-glow'
                  : 'bg-white/5 text-TEXT_SECONDARY border border-white/5 hover:bg-white/10'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </header>
      )}

      <div className="p-4">
        <div className="relative h-56 w-full rounded-[2.5rem] overflow-hidden shadow-2xl group active:scale-[0.98] transition-all bg-white/5">
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"></div>
          {heroItem?.image_url ? (
            <Image
              src={heroItem.image_url}
              alt="Featured Item"
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-80"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <ShoppingBasket size={64} />
              <span className="absolute text-[10rem] font-black pointer-events-none opacity-5 select-none">TANJAI</span>
            </div>
          )}

          <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
            <div className="glass-panel px-3 py-1 rounded-full border-BURNT_ORANGE/30 w-fit">
              <span className="text-[10px] font-black tracking-widest text-BURNT_ORANGE uppercase italic">
                {heroItem ? "Chef's Recommendation" : "Welcome to Tanjai"}
              </span>
            </div>
          </div>

          <div className="absolute bottom-6 left-6 z-20">
            <h2 className="text-2xl font-black font-display text-white mb-1">
              {heroItem ? heroItem.name : "Authentic Flavors"}
            </h2>
            <p className="text-sm text-gray-300 font-medium italic max-w-[200px] line-clamp-1">
              {heroItem ? heroItem.description : "Discover our signature dishes"}
            </p>
          </div>

          <button
            onClick={() => heroItem ? addToCart(heroItem) : toast.info('Browse our menu below!')}
            className="absolute bottom-6 right-6 z-20 bg-BURNT_ORANGE text-white p-4 rounded-2xl shadow-glow hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      <main className="px-4 pb-12">
        {loading ? (
          <MenuSkeleton />
        ) : error ? (
          <ErrorDisplay />
        ) : filteredItems.length === 0 ? (
          <div className="grid grid-cols-2 gap-4">
            <EmptyState />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="glass-panel rounded-[2rem] overflow-hidden group active:scale-95 transition-all duration-200 flex flex-col"
              >
                <div className="relative h-36 w-full overflow-hidden">
                  {item.image_url ? (
                    <SafeImage
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-white/5 flex items-center justify-center text-TEXT_MUTED">
                      <ShoppingBasket size={32} opacity={0.2} />
                    </div>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); setViralItem(item); }}
                    className="absolute top-3 right-3 z-10 glass-panel p-2 rounded-full text-white/80 hover:text-white transition-all shadow-lg"
                  >
                    <Share2 size={14} />
                  </button>
                </div>

                <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-white text-base leading-tight truncate font-display">
                      {item.name}
                    </h3>
                    <p className="text-[10px] text-TEXT_SECONDARY mt-1 line-clamp-1">{item.description}</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-BURNT_ORANGE font-black text-lg font-mono">
                      <span className="text-[10px] mr-1">฿</span>{item.price}
                    </span>
                    <button
                      onClick={() => addToCart(item)}
                      className="bg-white/5 hover:bg-BURNT_ORANGE text-TEXT_SECONDARY hover:text-white p-2.5 rounded-2xl border border-white/5 shadow-inner transition-all group/btn"
                    >
                      <Plus size={18} className="group-active/btn:rotate-90 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Visual indicator that end is reached */}
            {!loading && filteredItems.length > 0 && (
              <div className="col-span-2 py-8 text-center">
                <p className="text-[10px] text-TEXT_SECONDARY/40 font-medium tracking-widest uppercase">
                  You've reached the end of the menu
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 5. Bottom Navigation / Floating Cart */}
      {!isKiosk && (
        <nav className="fixed bottom-0 left-0 right-0 glass-nav pt-4 pb-8 px-6 z-50">
          <CartDrawer restaurantId={params.tenant} tableId="5" />
        </nav>
      )}

      {isKiosk && cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-6">
          <CartDrawer restaurantId={params.tenant} tableId="KIOSK" />
        </div>
      )}

      {/* Viral Modal */}
      {viralItem && (
        <ViralModal item={viralItem} onClose={() => setViralItem(null)} />
      )}
    </div>
  );
}

// Wrap with Suspense for useSearchParams() compatibility in Next.js 14
export default function MenuPage({ params }: { params: { tenant: string } }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#121212] flex items-center justify-center"><Loader2 className="animate-spin text-BURNT_ORANGE" size={48} /></div>}>
      <MenuPageContent params={params} />
    </Suspense>
  );
}
