'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useCartStore } from '../cart-store';
import { Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  image_url: string | null;
  is_available: boolean;
};

export function MenuItemCard({ item }: { item: MenuItem }) {
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity: quantity,
      options: {} // TODO: Add options support
    });
    setIsOpen(false);
    setQuantity(1);
    toast.success(`Added ${item.name} to cart`);
  };

  return (
    <>
      <div 
        onClick={() => item.is_available && setIsOpen(true)}
        className={`flex flex-col gap-2 p-4 border rounded-lg shadow-sm bg-card hover:bg-accent/5 transition-colors cursor-pointer ${!item.is_available ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
          {item.image_url ? (
            <Image 
              src={item.image_url} 
              alt={item.name} 
              fill 
              className="object-cover" 
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
          {!item.is_available && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 font-bold text-destructive">
              Out of Stock
            </div>
          )}
        </div>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold">{item.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
          </div>
          <span className="font-bold">฿{item.price}</span>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{item.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
             <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
                {item.image_url && <Image src={item.image_url} alt={item.name} fill className="object-cover" />}
             </div>
             <p className="text-muted-foreground">{item.description}</p>
             
             <div className="flex items-center justify-between border p-4 rounded-lg">
                <span className="font-medium">Quantity</span>
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                        <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-lg font-bold w-8 text-center">{quantity}</span>
                    <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
             </div>
          </div>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
             <div className="flex-1 flex items-center justify-between px-2 font-bold text-lg">
                Total: ฿{item.price * quantity}
             </div>
            <Button onClick={handleAddToCart} className="w-full sm:w-auto">Add to Cart</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
