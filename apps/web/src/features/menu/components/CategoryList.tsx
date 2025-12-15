'use client';

import { useState } from 'react';
import { Plus, MoreVertical, Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Database } from '@/lib/database.types';

type Category = Database['public']['Tables']['menu_categories']['Row'];

interface CategoryListProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export function CategoryList({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onEdit,
  onDelete,
  onAdd,
}: CategoryListProps) {
  return (
    <div className="w-64 border-r h-full flex flex-col bg-background">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="font-semibold text-lg">Categories</h2>
        <Button size="icon" variant="ghost" onClick={onAdd}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <button
          onClick={() => onSelectCategory(null)}
          className={cn(
            'w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors',
            selectedCategoryId === null
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted'
          )}
        >
          All Items
        </button>
        {categories.map((category) => (
          <div
            key={category.id}
            className={cn(
              'group flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors',
              selectedCategoryId === category.id
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            )}
          >
            <button
              onClick={() => onSelectCategory(category.id)}
              className="flex-1 text-left truncate"
            >
              {category.name}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity",
                    selectedCategoryId === category.id && "text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" 
                  )}
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(category)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(category.id)} className="text-destructive">
                  <Trash className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  );
}
