import React from "react";
import { Search, MapPin, ChevronDown } from "lucide-react";

export const GroceryHeader = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm px-4 py-3 shadow-sm">
      {/* Location Selector */}
      <div className="flex items-center justify-center mb-4 cursor-pointer">
        <span className="text-xs text-gray-500 mr-1">Delivery to</span>
        <div className="flex items-center text-gray-900 font-bold text-sm">
           <MapPin className="w-3 h-3 text-primary mr-1" />
           <span>Home • Bangkok</span>
           <ChevronDown className="w-3 h-3 ml-1 text-gray-400" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border-none rounded-2xl leading-5 bg-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-shadow"
          placeholder="Search ramen, drinks..."
        />
      </div>
    </header>
  );
};
