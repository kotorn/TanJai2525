'use client';

import { Card, CardContent, CardFooter } from '@tanjai/ui';
import { Badge } from '@tanjai/ui';
import { Button } from '@tanjai/ui';
import { SafeImage } from '@tanjai/ui';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  description?: string;
  isAvailable: boolean;
  onAddToCart: (id: string) => void;
}

export function ProductCard({
  id,
  name,
  price,
  imageUrl,
  description,
  isAvailable,
  onAddToCart,
}: ProductCardProps) {
  return (
    <Card className="overflow-hidden bg-zinc-900 border-zinc-800 hover:border-amber-500/50 transition-colors">
      <div className="relative aspect-square">
        <SafeImage
          src={imageUrl || '/placeholder-food.jpg'}
          alt={name}
          fill
          className="object-cover"
        />
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Badge variant="destructive">Out of Stock</Badge>
          </div>
        )}
      </div>
      <CardContent className="p-3">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-white text-sm line-clamp-1">{name}</h3>
          <p className="text-amber-500 font-bold text-sm">฿{price}</p>
        </div>
        {description && (
          <p className="text-zinc-400 text-xs mt-1 line-clamp-2">{description}</p>
        )}
      </CardContent>
      <CardFooter className="p-3 pt-0">
        <Button
          className="w-full bg-amber-600 hover:bg-amber-500 text-white h-8 text-xs font-bold"
          disabled={!isAvailable}
          onClick={() => onAddToCart(id)}
        >
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
