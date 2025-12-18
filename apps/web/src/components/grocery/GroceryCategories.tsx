"use client";

import React from "react";

const categories = [
  { id: "all", name: "All", icon: "🍽️", bg: "bg-orange-100" },
  { id: "ramen", name: "Ramen", icon: "🍜", bg: "bg-red-100" },
  { id: "congee", name: "Congee", icon: "🥣", bg: "bg-blue-100" },
  { id: "sides", name: "Sides", icon: "🥟", bg: "bg-green-100" },
  { id: "drinks", name: "Drinks", icon: "🥤", bg: "bg-purple-100" },
  { id: "sweet", name: "Sweet", icon: "🍰", bg: "bg-pink-100" },
];

export const GroceryCategories = () => {
  const [active, setActive] = React.useState("all");

  return (
    <div className="w-full overflow-x-auto pt-6 pb-4 -mx-4 px-4 no-scrollbar">
      <div className="flex gap-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActive(cat.id)}
            className="flex flex-col items-center gap-2 flex-shrink-0 group"
          >
            <div className={`
              w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-sm transition-all duration-300
              ${active === cat.id ? "bg-primary text-white shadow-glow scale-110" : "bg-white text-gray-600 border border-gray-100 group-hover:shadow-md"}
            `}>
              {cat.icon}
            </div>
            <span className={`text-xs font-medium transition-colors ${active === cat.id ? "text-primary font-bold" : "text-gray-500"}`}>
                {cat.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
