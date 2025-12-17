"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

// --- MenuHeader ---
import { useTheme } from "../theme/ThemeProvider";

export const MenuHeader = ({ greeting = "Good Evening", name = "Guest" }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 glass-nav px-6 py-4 flex justify-between items-center transition-all duration-300">
      <div>
        <p className="text-secondary-500 text-sm font-medium tracking-wide">
          {greeting},
        </p>
        <h2 className="dark:text-white text-gray-900 text-xl font-bold font-display">{name}</h2>
      </div>
      <div className="flex items-center gap-3">
        <button 
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10"
        >
             <span className="material-symbols-outlined text-primary-500 text-sm">
                {theme === 'dark' ? 'dark_mode' : 'light_mode'}
             </span>
        </button>
        <div className="flex items-center gap-1">
             <span className="material-symbols-outlined text-primary-500">
            location_on
            </span>
            <span className="text-gray-400 text-sm font-light">
            Tanjai
            </span>
        </div>
      </div>
    </div>
  );
};

// --- CategoryScroll ---
export const CategoryScroll = ({ categories, activeCategory, onSelect }) => {
  return (
    <div className="flex gap-3 overflow-x-auto px-6 py-4 snap-x no-scrollbar mt-20 pb-8">
      {categories.map((cat: any) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`relative flex-shrink-0 px-5 py-2.5 rounded-2xl transition-all duration-300 snap-start border ${
            activeCategory === cat.id
              ? "bg-gradient-to-br from-primary-500/20 to-primary-500/5 border-primary-500/50 text-white shadow-[0_0_20px_-5px_rgba(238,108,43,0.5)] scale-105"
              : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/20"
          }`}
        >
          <span className="text-sm font-semibold tracking-wide font-display whitespace-nowrap">
            {cat.name}
          </span>
          {activeCategory === cat.id && (
            <motion.div
              layoutId="activeCategoryGlow"
              className="absolute inset-0 rounded-2xl bg-primary-500/10 blur-md -z-10"
            />
          )}
        </button>
      ))}
    </div>
  );
};

// --- MenuHero ---
export const MenuHero = () => {
  return (
    <div className="px-6 py-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full h-56 rounded-3xl overflow-hidden shadow-2xl shadow-primary-500/10 bg-gray-900 group"
      >
        <div className="absolute top-4 left-4 z-20">
          <span className="glass-panel px-3 py-1.5 rounded-full text-xs font-bold text-white flex items-center gap-1.5 border border-white/10 shadow-lg">
            <span className="material-symbols-outlined text-sm text-secondary-500">star</span>
            Chef's Pick
          </span>
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
        
        {/* Placeholder for Hero Image */}
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
             <span className="text-gray-700 font-display text-4xl opacity-20 font-bold tracking-widest">FOOD ART</span>
        </div>

        <div className="absolute bottom-5 left-5 right-5 z-20 flex justify-between items-end">
          <div className="space-y-1">
            <h3 className="text-white text-2xl font-bold font-display leading-none tracking-tight">
              Midnight Ramen
            </h3>
            <p className="text-gray-300 text-xs font-light tracking-wide max-w-[150px]">
                Rich 12hr bone broth, chashu, and marinated egg.
            </p>
          </div>
          <button className="bg-gradient-to-r from-primary-500 to-[#e05e22] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary-500/30 active:scale-95 transition-all hover:brightness-110">
            Order Now
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- MenuList ---
// --- MenuList ---
export const MenuList = ({ items }) => {
  return (
    <div className="px-6 pb-28 space-y-6">
      <div className="flex justify-between items-end mb-4">
         <h3 className="text-white text-xl font-bold font-display tracking-tight">
            Comfort Selection
         </h3>
         <span className="text-xs text-gray-500 font-medium">{items.length} dishes</span>
      </div>
      
      <div className="grid gap-4">
      {items.map((item: any) => (
        <MenuItemCard key={item.id} item={item} />
      ))}
      </div>
    </div>
  );
};

// --- MenuItemCard (High Fidelity) ---
const MenuItemCard = ({ item }: { item: any }) => {
    return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          whileTap={{ scale: 0.98 }}
          className="group relative p-3 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 shadow-lg backdrop-blur-sm overflow-hidden"
        >
           {/* Glass Shine Effect */}
           <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="flex gap-4">
            {/* Image Container */}
            <div className="w-24 h-24 rounded-xl bg-gray-800 flex-shrink-0 relative overflow-hidden shadow-inner group-hover:shadow-glow transition-all duration-500">
               {/* Placeholder for Item Image */}
                <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-xs font-medium">
                   {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                    ) : (
                        <span className="material-symbols-outlined text-4xl opacity-20">ramen_dining</span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-between py-1">
              <div>
                <div className="flex justify-between items-start">
                  <h4 className="text-white font-bold text-lg font-display leading-tight">{item.name}</h4>
                  <span className="text-secondary-500 font-bold text-lg drop-shadow-sm">฿{item.price}</span>
                </div>
                <p className="text-gray-400 text-xs mt-1 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>
              
              <div className="flex justify-between items-end mt-2">
                 <div className="flex gap-1.5 flex-wrap">
                    {item.tags?.map((tag:string) => (
                        <span key={tag} className="text-[10px] uppercase tracking-wider font-bold text-gray-400 bg-black/20 px-2 py-1 rounded-md border border-white/5">
                            {tag}
                        </span>
                    ))}
                </div>
                <button className="w-9 h-9 rounded-full bg-gradient-to-r from-primary-500 presumably-to-primary-600 text-white shadow-lg shadow-primary-500/20 flex items-center justify-center hover:scale-110 active:scale-90 transition-transform duration-200">
                    <span className="material-symbols-outlined text-xl">add</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
    )
}

// --- BottomNav ---
export const BottomNav = () => {
    return (
        <div className="fixed bottom-0 left-0 right-0 glass-nav h-20 flex justify-around items-center pb-4 px-2 z-50">
            <NavIcon icon="home" label="Home" active />
            <NavIcon icon="restaurant_menu" label="Menu" />
            <div className="relative">
                <NavIcon icon="receipt_long" label="Orders" />
                <span className="absolute top-0 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border border-black"></span>
            </div>
            <NavIcon icon="person" label="Profile" />
        </div>
    )
}

const NavIcon = ({ icon, label, active = false }: { icon: string, label: string, active?: boolean }) => (
    <button className={`flex flex-col items-center gap-1 w-16 ${active ? 'text-primary-500' : 'text-gray-400'}`}>
        <span className={`material-symbols-outlined ${active ? 'filled' : ''}`}>{icon}</span>
        <span className="text-[10px] font-medium">{label}</span>
    </button>
)
