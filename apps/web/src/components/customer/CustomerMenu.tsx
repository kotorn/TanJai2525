"use client";

import { useState } from "react";
import {
  MenuHeader,
  CategoryScroll,
  MenuHero,
  MenuList,
  BottomNav,
} from "./MenuComponents";
import { ThemeProvider } from "../theme/ThemeProvider";

// Mock Data
const CATEGORIES = [
  { id: "all", name: "All Comforts" },
  { id: "ramen", name: "Ramen" },
  { id: "congee", name: "Congee" },
  { id: "sides", name: "Sides" },
  { id: "drinks", name: "Drinks" },
];

const MENU_ITEMS = [
  {
    id: 1,
    name: "Classic Tonkotsu",
    price: 189,
    description: "Rich pork bone broth, chashu, soft-boiled egg, bamboo shoots.",
    category: "ramen",
    tags: ["Best Seller", "Pork"],
  },
  {
    id: 2,
    name: "Spicy Miso",
    price: 199,
    description: "Miso blend with chili oil, ground pork, corn, and butter.",
    category: "ramen",
    tags: ["Spicy"],
  },
  {
    id: 3,
    name: "Century Egg Congee",
    price: 89,
    description: "Silky rice porridge served with century egg and ginger.",
    category: "congee",
    tags: ["Comfort"],
  },
  {
      id: 4,
      name: "Gyoza (6 pcs)",
      price: 79,
      description: "Pan-fried pork dumplings served with dipping sauce.",
      category: "sides",
      tags: ["Snack"]
  }
];

export default function CustomerMenu() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredItems =
    activeCategory === "all"
      ? MENU_ITEMS
      : MENU_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <ThemeProvider>
    <div className="min-h-screen bg-background-dark dark:bg-background-dark bg-gray-50 text-foreground pb-20 relative overflow-hidden">
       {/* Ambient Glow */}
       <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[100px] pointer-events-none" />

      <MenuHeader greeting="Good Evening" name="Khun Tan" />
      
      <CategoryScroll
        categories={CATEGORIES}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />

      <div className="mt-4">
          <MenuHero />
      </div>

      <div className="mt-6">
        <MenuList items={filteredItems} />
      </div>

      <BottomNav />
    </div>
    </ThemeProvider>
  );
}
