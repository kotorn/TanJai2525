'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

export function TopBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative bg-gradient-to-r from-anon-salmon-pink to-anon-sandy-brown text-white">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex-1"></div>
        
        <p className="text-anon-7 font-medium text-center">
          🎉 <span className="font-bold">Free Shipping</span> This Week Order Over ฿500
        </p>
        
        <div className="flex-1 flex justify-end">
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Close banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
