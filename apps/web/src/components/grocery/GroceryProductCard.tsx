import React from "react";
import { Plus } from "lucide-react";

interface GroceryProductCardProps {
    id: number;
    name: string;
    price: number;
    image: string;
}

export const GroceryProductCard: React.FC<GroceryProductCardProps> = ({ name, price, image }) => {
  return (
    <div className="group cursor-pointer">
      {/* Editorial Image Container (Square or Portrait) */}
      <div className="relative w-full aspect-square overflow-hidden mb-4 bg-gray-100">
         <div className="absolute inset-0 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform duration-700 ease-out">
            {/* Fallback emoji */}
            {name.includes("Cake") ? "🍰" : name.includes("Pastry") ? "🥐" : "🧁"}
         </div>
      </div>
      
      {/* Minimal Details */}
      <div className="flex flex-col items-start space-y-1">
        <h3 className="font-body font-bold text-black text-sm tracking-wide uppercase">{name}</h3>
        <p className="font-body text-gray-500 text-sm">Delicious description goes here.</p>
        <div className="flex items-center justify-between w-full mt-2">
             <span className="font-body text-black text-sm">฿{price.toFixed(2)}</span>
             <button className="text-xs uppercase tracking-widest text-black border-b border-black pb-0.5 hover:text-gray-600 hover:border-gray-400 transition-colors">
                Add to Cart
             </button>
        </div>
      </div>
    </div>
  );
};
