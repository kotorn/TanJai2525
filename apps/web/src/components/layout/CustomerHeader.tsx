import React from "react";
import { MapPin } from "lucide-react";

export const CustomerHeader = () => {
  return (
    <header className="sticky top-0 z-50 glass-nav px-4 py-3 flex justify-between items-center transition-all duration-300">
      <div className="flex flex-col">
        <h1 className="text-lg font-display font-bold text-white leading-tight">
          Good Evening, <span className="text-primary">Guest</span>
        </h1>
        <div className="flex items-center text-xs text-muted-foreground mt-1">
          <MapPin className="w-3 h-3 mr-1 text-primary" />
          <span>Tanjai HQ, Bangkok</span>
        </div>
      </div>
      <div className="w-10 h-10 rounded-full bg-surface-dark/50 border border-white/10 flex items-center justify-center shadow-lg backdrop-blur-md">
        <span className="text-lg">🌙</span>
      </div>
    </header>
  );
};
