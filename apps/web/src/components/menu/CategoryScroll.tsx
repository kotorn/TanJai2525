"use client";

import React from "react";

const categories = [
  { id: "all", name: "All" },
  { id: "ramen", name: "Ramen" },
  { id: "congee", name: "Congee" },
  { id: "appetizer", name: "Sides" },
  { id: "drinks", name: "Drinks" },
  { id: "dessert", name: "Sweet" },
];

export const CategoryScroll = () => {
  const [activeCategory, setActiveCategory] = React.useState("all");

  return (
    <div className="w-full overflow-x-auto pb-4 pt-2 -mx-4 px-4 no-scrollbar snap-x cursor-grab active:cursor-grabbing">
      <div className="flex gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`
              flex-shrink-0 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 snap-center border
              ${
                activeCategory === category.id
                  ? "bg-primary border-primary text-white shadow-glow scale-105"
                  : "bg-surface-dark/40 border-white/5 text-gray-400 hover:text-white backdrop-blur-sm"
              }
            `}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};
