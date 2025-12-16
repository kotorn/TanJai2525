'use client';
import { HeroCard } from '@/components/menu/HeroCard';
import { CategoryNav } from '@/components/menu/CategoryNav';
import { ProductCard } from '@/components/menu/ProductCard';
import { ProductListItem } from '@/components/menu/ProductListItem';
import { BottomNav } from '@/components/layout/BottomNav';

const HERO_ITEM = {
    title: "Truffle Mushroom Congee",
    description: "Slow-cooked jasmine rice porridge infused with black truffle oil, topped with wild mushrooms and crispy shallots.",
    price: 350,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBfC3EZyJqEZguDwEXsve_HpicjmkTPO_cj9P6jvHzHJKJKjljLhOzyq152AgKm0hpd2CPZ6P8r9yE2V7I1xUFicFw9pdeVYtN2YeX_tXxBsbkXVFhJr7iscuRa7nb_Tm_KStw10H7yGLImEMHBWP3Qzgf0G6mpxbzavw9xS-QEQ75BZgmWqwAcd0TsRqoTISOFlAvdl1N7y-faqomV9dR9NPgJ5w5lJCLK7YYJ1csDwCDuLFP7aPIJgvCn21D0zgNlkmh6AE23B8I"
};

const RAMEN_ITEMS = [
  { id: '1', name: 'Spicy Miso Tonkotsu', price: 299, description: 'Rich pork broth simmered for 20 hours, spicy chili paste.', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPO8U4EW1E3NpZPnGu5Yiv0FbzgGZCkiFBnIDTxzD_mQ6lO_j5KyRdC60zN6F-RVsUXEmTgcIc_Ta7PhTwW0-hLl6qBENFhtaqrD2ctkZiNG00yT85zmI5GbW4pmQMhGpq5HBJg7o9xMTaRd8xqK-aCsroGbsKbmPsW0J-LNyiSBZ0DO4TbNYU0czqadAGIKUp9-hN9QPgC4D8h7XnuZqCbzhJRObyWJNQxufGkWWH4VjzNT4PwW7qKRrA4wpDaAm1iSB1YsV7mSg' },
  { id: '2', name: 'Black Garlic Shoyu', price: 289, description: 'Savory soy sauce broth, burnt garlic oil, char siu pork.', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRrhZNDJUYvkyt44vOJuHyTmM30BlMeLQeQQXoUVHFDVa9HnYLoju9TxcNTwh_LQMLrZ69fzlVTZ7kqrvK0FAAHy8HtB5FCLTpdo-y5HhlAAbR5zEzaZc2V75G3Kl1sUvfMwhfFubdS307gHQZ0g9fn7mLtjrde3zsMdI2VsdDHryibjihwGzj4LsyZL9IujjPY3CJxV65HoNFX0J-B3yw_2qVkIDtIT0cQPGmEhq8HpBO4SsjTTIR41R0tQBQgM-LKUGT6PqPWEc' },
];

const CONGEE_ITEMS = [
  { id: '3', name: 'Century Egg & Pork', price: 159, description: 'Classic comfort with preserved egg and ginger.', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApnBx-4hOGfMLZJsYiZZ_9uZosidMhF8jdAh5OVL0m6c60Bu311Nx_QRqVfaMGvSrOGRwbu0zASeD_jbWOaPiGobRw1N5kBHkcTe6XIZ0zY4esdMghoClqJKQPag1zFuhmHsOs3Ldw90Ux0D4kDJYFoxZefvelszeNCcuOCa7Ied3QJXvRyLXUzlXHLjYn1TTin98g-92vH4A34dg96wx2jI0jkscOfHL1MawQot6Qe0M0H7lJH8OU8lOHWZACJZ5xTkaaNx2LdQU' },
  { id: '4', name: 'Scallop & Ginger', price: 329, description: 'Fresh Hokkaido scallops with julienned ginger.', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApbKDhpLXn3wm7VG3L-eFBuTXqP8-g2Kdn5R-F9C1BvyxW5CfNxceXHk3mvowGGQYZ2a1Le9Elq1FXF4pMsLeL9UJ7pSDLb-bD3ow2n1hhAdIYafC1XTBnWyqKva7FYtiL7qhfkc8MfJcRbzJr7bD7gJTj3PyHZiCqF9q1DxUObF4VfvPzjmPrFQPU55SoMP1pVy098-3bXGtZnVuxR6Rwp9dXK4T4C_n3V0jOz0of6i8OoQiZQbHflFxl5Zllsu3hiTepon92RuE' },
];

export default function MenuDemoPage() {
  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden pb-24 max-w-md mx-auto shadow-2xl bg-[#121212]">
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 glass-nav px-4 pt-6 pb-4">
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <div className="flex items-center gap-1 text-primary/80 mb-0.5">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        <span className="text-xs font-medium uppercase tracking-wider">Shinjuku, Tokyo</span>
                    </div>
                    <h2 className="text-white text-xl font-bold leading-tight tracking-tight">Good Evening, Kenji</h2>
                </div>
                <button className="flex size-10 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white border border-white/5">
                    <span className="material-symbols-outlined">search</span>
                </button>
            </div>
        </header>

        <CategoryNav />

        <HeroCard {...HERO_ITEM} />

        <section className="mb-6">
            <div className="flex items-center justify-between px-4 mb-4">
                <h3 className="text-white text-lg font-bold tracking-tight font-display">Signature Ramen</h3>
                <button className="text-primary text-sm font-medium hover:text-secondary transition-colors">See All</button>
            </div>
            <div className="flex flex-col gap-4 px-4">
                {RAMEN_ITEMS.map(item => (
                    <ProductListItem key={item.id} {...item} />
                ))}
            </div>
        </section>

        <section className="mb-4">
            <div className="flex items-center justify-between px-4 mb-4">
                <h3 className="text-white text-lg font-bold tracking-tight font-display">Comfort Congee</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 px-4">
                {CONGEE_ITEMS.map(item => (
                    <ProductCard key={item.id} {...item} />
                ))}
            </div>
        </section>

        <BottomNav restaurantId="demo-shop" tableId="demo-table" />
    </div>
  );
}
