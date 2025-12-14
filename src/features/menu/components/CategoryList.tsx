"use client";

import { Category, MenuItem } from "@/features/menu/actions";
import { cn } from "@/lib/utils";
import { GripVertical, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteCategory } from "@/features/menu/actions";
import { toast } from "sonner";

interface CategoryListProps {
  categories: Category[];
  items: MenuItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onRefresh: () => void;
}

export function CategoryList({ categories, items, selectedId, onSelect, onRefresh }: CategoryListProps) {
  
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent selection when clicking delete
    if (!confirm("คุณแน่ใจว่าต้องการลบหมวดหมู่นี้?")) return;

    try {
      const result = await deleteCategory(id);
      if (result.success) {
        toast.success("ลบหมวดหมู่เรียบร้อยแล้ว");
        onRefresh();
        if (selectedId === id) onSelect(null);
      } else {
        toast.error("เกิดข้อผิดพลาดในการลบหมวดหมู่");
      }
    } catch (error) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const getItemCount = (categoryId: string) => {
    return items.filter(item => item.category_id === categoryId).length;
  };

  return (
    <div className="divide-y divide-gray-50">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          "w-full text-left px-4 py-3 text-sm font-medium transition-colors hover:bg-orange-50/50 flex justify-between items-center",
          selectedId === null
            ? "bg-orange-50 text-orange-700 border-l-4 border-orange-500"
            : "text-gray-600 border-l-4 border-transparent"
        )}
      >
        <span>ทั้งหมด</span>
        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
          {items.length}
        </span>
      </button>

      {categories.map((category) => (
        <div
          key={category.id}
          className={cn(
            "group flex items-center justify-between transition-colors hover:bg-orange-50/50",
            selectedId === category.id
              ? "bg-orange-50 text-orange-700 border-l-4 border-orange-500"
              : "border-l-4 border-transparent"
          )}
        >
          <button
            onClick={() => onSelect(category.id)}
            className="flex-1 text-left px-4 py-3 text-sm font-medium flex items-center gap-3 text-gray-600 group-hover:text-orange-700"
          >
            {/* Drag Handle - only visible on hover */}
            <GripVertical className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 cursor-move" />
            
            <span className="flex-1">{category.name}</span>
            
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs transition-colors",
              selectedId === category.id 
                ? "bg-orange-100 text-orange-700" 
                : "bg-gray-100 text-gray-600"
            )}>
              {getItemCount(category.id)}
            </span>
          </button>

          {/* Actions Dropdown */}
          <div className="pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); /* TODO: Edit */ }}>
                  <Edit className="w-4 h-4 mr-2" />
                  แก้ไข
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-700 focus:bg-red-50"
                  onClick={(e) => handleDelete(e, category.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  ลบ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
}
