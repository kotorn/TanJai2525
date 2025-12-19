import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@tanjai/ui'; 
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/stores/useCartStore';

export interface ProductCardProps {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string | null;
  onAdd?: () => void; // Optional now as we use direct store
}

export const ProductCard = ({ id, name, description, price, imageUrl }: ProductCardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const { items, addItem, removeItem } = useCartStore();
  
  // Find quantity for this item
  const cartItem = items.find(item => item.menuItemId === id);
  const quantity = cartItem?.quantity || 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
        menuItemId: id,
        name,
        price,
        quantity: 1,
        imageUrl: imageUrl || undefined,
        // Add other required fields if any (e.g. image)
    });
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeItem(id);
  };

  return (
    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full group active:scale-[0.98] transition-all duration-200 cursor-pointer hover:shadow-md">
      {/* Image Container */}
      <div className="w-full aspect-square rounded-lg bg-gray-50 mb-3 overflow-hidden relative">
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
          <div className="flex w-full h-full items-center justify-center text-gray-300">
            <span className="text-xs">No Image</span>
          </div>
        )}
        
        {/* Quantity Badge (Top Right) */}
        {quantity > 0 && (
            <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-lg animate-in zoom-in-50 border-2 border-white">
                {quantity}
            </div>
        )}
      </div>

      {/* Content */}
      <div className="mb-3">
        <h4 className="text-gray-900 font-bold text-sm mb-1 line-clamp-1">{name}</h4>
        {description && (
            <p className="text-gray-500 text-xs leading-snug line-clamp-2">
                {description}
            </p>
        )}
      </div>

      {/* Footer: Price & Action */}
      <div className="mt-auto flex items-center justify-between gap-2">
        <span className="text-primary font-bold text-sm">
            ฿{price.toLocaleString()}
        </span>

        {quantity === 0 ? (
            <Button 
                className="h-8 w-8 rounded-full bg-gray-100 hover:bg-primary hover:text-white text-gray-600 p-0 shadow-none transition-colors" 
                onClick={handleAdd}
                size="icon"
            >
                <Plus className="h-4 w-4" />
            </Button>
        ) : (
            <div className="flex items-center bg-gray-100 rounded-full p-0.5">
                <button 
                    onClick={handleRemove}
                    className="w-7 h-7 flex items-center justify-center bg-white rounded-full text-gray-600 shadow-sm hover:text-primary active:scale-95 transition-all"
                >
                    <Minus className="h-3 w-3" />
                </button>
                <span className="w-6 text-center text-xs font-bold text-gray-900">
                    {quantity}
                </span>
                <button 
                    onClick={handleAdd}
                    className="w-7 h-7 flex items-center justify-center bg-primary rounded-full text-white shadow-sm hover:bg-primary/90 active:scale-95 transition-all"
                >
                    <Plus className="h-3 w-3" />
                </button>
            </div>
        )}
      </div>
    </div>
  );
};
