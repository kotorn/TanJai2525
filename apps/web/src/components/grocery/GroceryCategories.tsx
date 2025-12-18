"use client";

import React from "react";

const categories = [
  { id: "limited", name: "Limited Edition" },
  { id: "cakes", name: "Cakes" },
  { id: "pastries", name: "Sweet Pastries" },
  { id: "savoury", name: "Savoury Pastries" },
  { id: "catering", name: "Catering Boxes" },
];

export const GroceryCategories = () => {
  const [active, setActive] = React.useState("limited");

  return (
    <div className="w-full lg:w-64 flex-shrink-0 lg:border-r border-black/5 lg:min-h-screen p-6 bg-white">
      <h3 className="font-display font-bold text-lg mb-6 hidden lg:block">Collections</h3>
      
      {/* Desktop Vertical List */}
      <div className="hidden lg:flex flex-col gap-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActive(cat.id)}
            className={`text-left text-sm transition-all duration-300 font-body
              ${active === cat.id ? "font-bold text-black translate-x-1" : "text-gray-500 hover:text-black"}
            `}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Mobile Horizontal Scroll (Editorial Style text links) */}
      <div className="lg:hidden w-full overflow-x-auto no-scrollbar -mx-6 px-6 pb-2">
         <div className="flex gap-8 border-b border-black/5 pb-3">
             {categories.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => setActive(cat.id)}
                    className={`whitespace-nowrap text-sm font-body transition-colors
                    ${active === cat.id ? "text-black font-bold border-b-2 border-black -mb-3.5 pb-3" : "text-gray-500"}
                    `}
                >
                    {cat.name}
                </button>
             ))}
         </div>
      </div>
    </div>
  );
};
