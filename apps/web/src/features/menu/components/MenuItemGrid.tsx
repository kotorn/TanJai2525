'use client';

import { Edit, Trash, MoreVertical, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Database } from '@/lib/database.types';

type MenuItem = Database['public']['Tables']['menu_items']['Row'];

interface MenuItemGridProps {
  items: MenuItem[];
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
}

export function MenuItemGrid({ items, onEdit, onDelete }: MenuItemGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-muted-foreground">
        <div className="bg-muted bg-opacity-50 p-6 rounded-full mb-4">
             <ImageIcon className="h-10 w-10 opacity-50" />
        </div>
        <p className="text-lg font-medium">No items found</p>
        <p className="text-sm">Select a category or add a new item to get started.</p>
      </div>
    );
  }

  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto">
      {items.map((item) => (
        <Card key={item.id} className="overflow-hidden group">
          <div className="aspect-square relative bg-muted flex items-center justify-center">
            {item.image_url ? (
               <Image
                src={item.image_url}
                alt={item.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <ImageIcon className="h-12 w-12 text-muted-foreground opacity-50" />
            )}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(item)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(item)} className="text-destructive">
                    <Trash className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold truncate" title={item.name}>{item.name}</h3>
            <p className="text-sm text-muted-foreground truncate">{item.description || 'No description'}</p>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-between items-center text-sm font-medium">
            <span>฿{item.price.toLocaleString()}</span>
            {!item.is_available && (
                <span className="text-destructive text-xs px-2 py-1 bg-destructive/10 rounded-full">Unavailable</span>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
