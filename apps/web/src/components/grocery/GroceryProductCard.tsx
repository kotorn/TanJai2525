import React from "react";
import { Plus, Star, Heart } from "lucide-react";

interface GroceryProductCardProps {
    id: number;
    name: string;
    price: number;
    image: string;
    unit?: string;
}

export const GroceryProductCard: React.FC<GroceryProductCardProps> = ({ name, price, image, unit = "bowl" }) => {
  return (
    <div className="bg-white p-3 rounded-[20px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-gray-100 flex flex-col h-full active:scale-[0.98] transition-all duration-200 group relative">
      <button className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm text-gray-400 hover:text-red-500 transition-colors">
          <Heart className="w-4 h-4" />
      </button>

      <div className="relative w-full aspect-[4/3.5] rounded-2xl overflow-hidden mb-3 bg-gray-50">
          {/* Card Top Rating Pill */}
          <div className="absolute top-2 left-2 z-10 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
             <Star className="w-3 h-3 text-orange-400 fill-orange-400" />
             <span className="text-[10px] font-bold text-gray-800">4.5</span>
             <span className="text-[10px] text-gray-400">(25+)</span>
          </div>

         <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform duration-500">
            {/* Fallback emoji logic based on name to make it look nicer than just ❓ */}
            {name.includes("Ramen") ? "🍜" : name.includes("Congee") ? "🥣" : "🍱"}
         </div>
      </div>
      
      <div className="flex-1 flex flex-col px-1">
        <h3 className="font-bold text-gray-900 text-base leading-snug mb-1 line-clamp-2">{name}</h3>
        <p className="text-xs text-gray-400 font-medium mb-3 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            {unit}
        </p>
        
        <div className="mt-auto flex items-center justify-between">
            <div className="flex items-baseline gap-1">
                 <span className="text-xs text-primary font-bold align-top">฿</span>
                 <span className="font-display font-bold text-xl text-gray-900">{price}</span>
            </div>
            <button className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-[#FF8F00] text-white flex items-center justify-center hover:shadow-lg hover:shadow-orange-500/30 transform active:scale-90 transition-all">
                <Plus className="w-5 h-5" />
            </button>
        </div>
      </div>
    </div>
  );
};
