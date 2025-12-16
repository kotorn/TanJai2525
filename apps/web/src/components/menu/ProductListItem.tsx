import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@tanjai/ui';
import { Plus } from 'lucide-react';
import { ProductCardProps } from './ProductCard';

export const ProductListItem = ({ name, description, price, imageUrl, onAdd }: ProductCardProps) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="glass-panel p-3 rounded-xl flex gap-4 items-center group active:bg-white/5 transition-colors cursor-pointer">
      <div className="w-24 h-24 shrink-0 rounded-lg bg-cover bg-center shadow-md overflow-hidden relative">
        {imageUrl ? (
           <Image
            src={imageUrl}
            alt={name}
            fill
            className={`object-cover transition-all duration-300 ${
              isLoading ? 'scale-105 blur-sm' : 'scale-100 blur-0'
            }`}
            onLoad={() => setIsLoading(false)}
            sizes="100px"
          />
        ) : (
            <div className="w-full h-full bg-white/5" />
        )}
        <div className="absolute inset-0 bg-black/10"></div>
      </div>
      
      <div className="flex flex-col flex-1 py-1 h-24">
        <div className="flex justify-between items-start mb-1">
          <h4 className="text-white font-bold text-base line-clamp-1">{name}</h4>
          <span className="text-secondary font-bold text-sm">฿{price.toLocaleString()}</span>
        </div>
        <p className="text-gray-400 text-xs font-body leading-relaxed line-clamp-2 mb-3">
            {description}
        </p>
        
        <div className="flex justify-between items-center mt-auto">
          <div className="flex items-center gap-1 text-xs text-gray-500">
             {/* Optional Meta Icons could go here */}
          </div>
          <button 
            className="size-8 rounded-full bg-primary/20 hover:bg-primary text-primary hover:text-white flex items-center justify-center transition-all active:scale-90"
            onClick={onAdd}
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
