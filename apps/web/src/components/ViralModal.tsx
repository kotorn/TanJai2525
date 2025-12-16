'use client';

import { X, Download, Share2 } from 'lucide-react';
import { useRef } from 'react';

// Mock Component for Viral Poster
export default function ViralModal({ item, onClose }: { item: any, onClose: () => void }) {
  const posterRef = useRef<HTMLDivElement>(null);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" role="dialog">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Poster Canvas Area */}
        <div ref={posterRef} className="relative bg-gradient-to-br from-orange-400 to-red-600 p-6 text-white text-center aspect-[4/5] flex flex-col items-center justify-center gap-4">
           <div className="bg-white/20 p-4 rounded-full backdrop-blur-md">
             {/* Placeholder Icon or Image */}
             <span className="text-6xl">🥘</span>
           </div>
           
           <div>
             <h2 className="text-3xl font-bold drop-shadow-md">{item.name.th || item.name.en}</h2>
             <p className="text-xl opacity-90">{item.price} ฿</p>
           </div>
           
           <div className="bg-white text-orange-600 font-bold px-4 py-1 rounded-full text-sm shadow-lg transform rotate-[-2deg]">
             Tanjai Recommended!
           </div>

           <div className="absolute bottom-4 text-[10px] opacity-70">
             Scan to Order @ Tanjai
           </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-gray-50 flex gap-3">
          <button className="flex-1 bg-gray-900 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <Download size={18} />
            Download
          </button>
          <button 
            onClick={onClose}
            className="p-3 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
