import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@tanjai/ui'; // Assuming we have a Button in our UI package
import { Plus } from 'lucide-react';

export interface ProductCardProps {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string | null;
  onAdd?: () => void;
}

export const ProductCard = ({ name, description, price, imageUrl, onAdd }: ProductCardProps) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="glass-panel p-3 rounded-xl flex flex-col h-full group active:bg-white/5 transition-colors cursor-pointer">
      {/* Image */}
      <div className="w-full aspect-square rounded-lg bg-cover bg-center mb-3 overflow-hidden relative">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className={`object-cover transition-all duration-300 ${
              isLoading ? 'scale-105 blur-sm' : 'scale-100 blur-0'
            }`}
            onLoad={() => setIsLoading(false)}
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div className="flex w-full h-full items-center justify-center bg-white/5 text-gray-500">
            <span className="text-xs">No Image</span>
          </div>
        )}
        
        {/* Floating Price Tag */}
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-bold text-white border border-white/10">
          ฿{price.toLocaleString()}
        </div>
      </div>

      {/* Content */}
      <h4 className="text-white font-bold text-sm mb-1 line-clamp-1">{name}</h4>
      {description && (
          <p className="text-gray-400 text-xs leading-snug line-clamp-2 mb-3">
            {description}
          </p>
      )}

      <Button 
        className="mt-auto w-full h-9 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary active:scale-95 text-sm font-medium text-gray-300 transition-all border border-white/5 shadow-none relative overflow-hidden group/btn" 
        onClick={onAdd}
        size="sm"
      >
        <span className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
        <Plus className="mr-2 h-4 w-4 relative z-10" />
        <span className="relative z-10">Add</span>
      </Button>
    </div>
  );
};
