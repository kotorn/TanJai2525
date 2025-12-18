import React from "react";
import { Plus } from "lucide-react";
import Image from "next/image";

interface GroceryProductCardProps {
    id: number;
    name: string;
    price: number;
    image: string;
    unit?: string;
}

export const GroceryProductCard: React.FC<GroceryProductCardProps> = ({ name, price, image, unit = "bowl" }) => {
  return (
    <div className="bg-white p-3 rounded-2xl shadow-soft border border-gray-100 flex flex-col h-full active:scale-[0.98] transition-all duration-200">
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-gray-50">
         {/* Placeholder for real image, using a colored div for now if image fails */}
         <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-3xl">
            🍜
         </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1 line-clamp-2">{name}</h3>
        <p className="text-xs text-gray-400 font-medium mb-3">{unit}</p>
        
        <div className="mt-auto flex items-center justify-between">
            <span className="font-bold text-lg text-primary">฿{price}</span>
            <button className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 shadow-md transform active:scale-95 transition-all">
                <Plus className="w-5 h-5" />
            </button>
        </div>
      </div>
    </div>
  );
};
