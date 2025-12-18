import React from "react";
import { Search, ShoppingBag, Menu } from "lucide-react";

export const GroceryHeader = () => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-black/5 px-6 py-5 flex items-center justify-between">
      {/* Left: Menu Trigger (Mobile) or Empty (Desktop) */}
      <div className="w-12">
        <Menu className="w-6 h-6 text-black lg:hidden cursor-pointer" />
      </div>

      {/* Center: Brand Logo */}
      <h1 className="text-2xl font-display font-bold tracking-widest text-black uppercase text-center flex-1">
        TanJai POS
      </h1>

      {/* Right: Actions */}
      <div className="flex items-center justify-end gap-5 w-12">
        <Search className="w-5 h-5 text-black cursor-pointer hover:text-gray-600 transition-colors" />
        <div className="relative cursor-pointer group">
            <ShoppingBag className="w-5 h-5 text-black group-hover:text-gray-600 transition-colors" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full"></span>
        </div>
      </div>
    </header>
  );
};
