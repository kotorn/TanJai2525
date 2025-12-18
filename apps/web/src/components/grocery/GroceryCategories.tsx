"use client";

import React from "react";

const categories = [
  { id: "all", name: "All", icon: "🍽️" },
  { id: "ramen", name: "Ramen", icon: "🍜" },
  { id: "congee", name: "Congee", icon: "🥣" },
  { id: "sides", name: "Sides", icon: "🥟" },
  { id: "drinks", name: "Drinks", icon: "🥤" },
  { id: "sweet", name: "Sweet", icon: "🍰" },
];

export const GroceryCategories = () => {
  const [active, setActive] = React.useState("all");

  return (
    <div className="w-full overflow-x-auto pt-4 pb-2 -mx-4 px-4 no-scrollbar">
      <div className="flex gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActive(cat.id)}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 border whitespace-nowrap
              ${
                active === cat.id
                  ? "bg-primary text-white border-primary shadow-soft transform scale-105"
                  : "bg-white text-gray-600 border-gray-100 hover:bg-gray-50 hover:border-gray-200"
              }
            `}
          >
            <span className="text-lg">{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
};
