import React from "react";
import { Search, MapPin, ChevronDown, SlidersHorizontal } from "lucide-react";

export const GroceryHeader = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md px-4 pt-2 pb-4 shadow-sm border-b border-gray-100">
       {/* Delivery Location */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-medium ml-1">Deliver to</span>
            <button className="flex items-center text-primary font-bold text-sm bg-orange-50 px-2 py-1 -ml-2 rounded-lg transition-colors hover:bg-orange-100">
               <MapPin className="w-3 h-3 mr-1" />
               <span className="truncate max-w-[150px]">Home • Bangkok</span>
               <ChevronDown className="w-3 h-3 ml-1" />
            </button>
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" width={40} height={40} />
        </div>
      </div>

      {/* Hero Title */}
      <h1 className="text-2xl font-display font-bold text-gray-900 mb-4 leading-tight w-[80%]">
        What would you like to eat?
      </h1>

      {/* Search Bar matching Figma */}
      <div className="flex gap-3">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-100 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white text-sm transition-all shadow-sm"
            placeholder="Find for food or restaurant..."
          />
        </div>
        <button className="w-12 h-[46px] flex items-center justify-center bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 text-gray-600">
             <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
