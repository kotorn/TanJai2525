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
    <div className="flex gap-4 overflow-x-auto px-6 py-4 snap-x no-scrollbar mt-20">
      {categories.map((cat: any) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`flex-shrink-0 px-6 py-2 rounded-full border transition-all duration-300 snap-start ${
            activeCategory === cat.id
              ? "bg-primary-500/20 border-primary-500 text-primary-500 shadow-glow"
              : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
          }`}
        >
          <span className="text-sm font-medium whitespace-nowrap">
            {cat.name}
          </span>
        </button>
      ))}
    </div>
  );
};

// --- MenuHero ---
export const MenuHero = () => {
  return (
    <div className="px-6 py-4">
      <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-2xl bg-gray-800">
        <div className="absolute top-4 left-4 z-10">
          <span className="glass-panel px-3 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">star</span>
            Chef &apos;s Special
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
        {/* Placeholder for Hero Image */}
        <div className="absolute inset-0 flex items-center justify-center text-gray-600 bg-gray-900">
            [Hero Image Placeholder]
        </div>
        <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end">
          <div>
            <h3 className="text-white text-lg font-bold font-display">
              Midnight Ramen
            </h3>
            <p className="text-gray-300 text-xs">Rich bone broth, slow-cooked</p>
          </div>
          <button className="bg-gradient-to-r from-primary-500 to-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-glow active:scale-95 transition-transform">
            Get Your Warmth
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MenuList ---
export const MenuList = ({ items }) => {
  return (
    <div className="px-6 pb-24 space-y-4">
      <h3 className="text-white text-lg font-bold font-display mb-2">
        Comfort Selection
      </h3>
      {items.map((item: any) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.98 }}
          className="glass-panel p-3 rounded-xl flex gap-4 items-center"
        >
          <div className="w-20 h-20 bg-gray-800 rounded-lg flex-shrink-0 relative overflow-hidden">
             {/* Placeholder for Item Image */}
              <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-xs">
                 Img
              </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h4 className="text-white font-medium text-base">{item.name}</h4>
              <span className="text-secondary-500 font-bold">฿{item.price}</span>
            </div>
            <p className="text-gray-400 text-xs mt-1 line-clamp-2">
              {item.description}
            </p>
            <div className="mt-2 flex gap-2">
                {item.tags?.map((tag:string) => (
                    <span key={tag} className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                        {tag}
                    </span>
                ))}
            </div>
          </div>
          <button className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-500 flex items-center justify-center border border-primary-500/50">
            <span className="material-symbols-outlined text-lg">add</span>
          </button>
        </motion.div>
      ))}
    </div>
  );
};

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
