'use client';

import { MenuItem, MenuItemCard } from './menu-item-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type Category = {
  id: string;
  name: string;
  menu_items: MenuItem[];
};

export function MenuGrid({ categories }: { categories: Category[] }) {
  if (!categories || categories.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">No menu items found.</div>;
  }

  return (
    <Tabs defaultValue={categories[0].id} className="w-full">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2">
        <TabsList className="w-full justify-start overflow-x-auto h-auto p-1">
            {categories.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id} className="min-w-fit px-4 py-2">
                {cat.name}
            </TabsTrigger>
            ))}
        </TabsList>
      </div>

      {categories.map((cat) => (
        <TabsContent key={cat.id} value={cat.id} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
            {cat.menu_items.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
