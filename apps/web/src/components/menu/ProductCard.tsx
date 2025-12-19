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
    <div className="glass-panel p-3 rounded-2xl flex flex-col h-full group active:scale-[0.98] transition-all duration-200 cursor-pointer hover:border-primary/20 hover:shadow-primary/5">
      {/* Image Container */}
      <div className="w-full aspect-square rounded-xl bg-secondary mb-3 overflow-hidden relative">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className={`object-cover transition-all duration-500 group-hover:scale-110 ${
              isLoading ? 'scale-105 blur-sm' : 'scale-100 blur-0'
            }`}
            onLoad={() => setIsLoading(false)}
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div className="flex w-full h-full items-center justify-center text-muted-foreground bg-secondary/50">
            <span className="text-xs">No Image</span>
          </div>
        )}
        
        {/* Quantity Badge (Top Right) */}
        {quantity > 0 && (
            <div className="absolute top-2 right-2 bg-destructive text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-lg border border-white/10 animate-in zoom-in-50">
                {quantity}
            </div>
        )}
      </div>

      {/* Content */}
      <div className="mb-3">
        <h4 className="text-foreground font-bold text-sm mb-1 line-clamp-1">{name}</h4>
        {description && (
            <p className="text-muted-foreground text-xs leading-snug line-clamp-2">
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
                className="h-8 w-8 rounded-full bg-secondary hover:bg-primary hover:text-black text-gray-400 p-0 shadow-none transition-colors border border-white/5" 
                onClick={handleAdd}
                size="icon"
            >
                <Plus className="h-4 w-4" />
            </Button>
        ) : (
            <div className="flex items-center bg-secondary rounded-full p-0.5 border border-white/5">
                <button 
                    onClick={handleRemove}
                    className="w-7 h-7 flex items-center justify-center bg-transparent rounded-full text-foreground hover:text-destructive active:scale-95 transition-all"
                >
                    <Minus className="h-3 w-3" />
                </button>
                <span className="w-6 text-center text-xs font-bold text-foreground">
                    {quantity}
                </span>
                <button 
                    onClick={handleAdd}
                    className="w-7 h-7 flex items-center justify-center bg-primary rounded-full text-black shadow-sm hover:bg-primary/90 active:scale-95 transition-all"
                >
                    <Plus className="h-3 w-3" />
                </button>
            </div>
        )}
      </div>
    </div>
  );
};
