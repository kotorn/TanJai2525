"use client";

import Image from "next/image";
import { MenuItem, deleteMenuItem, updateMenuItem } from "@/features/menu/actions";
import { MoreVertical, Edit, Trash2, Copy, EyeOff, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface MenuListProps {
  items: MenuItem[];
  categoryId: string | null;
  onRefresh: () => void;
}

export function MenuList({ items, categoryId, onRefresh }: MenuListProps) {
  const filteredItems = categoryId
    ? items.filter((item) => item.category_id === categoryId)
    : items;

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const result = await updateMenuItem(item.id, { is_available: !item.is_available });
      if (result.success) {
        toast.success(`อัพเดทสถานะ: ${!item.is_available ? "พร้อมขาย" : "หมด"}`);
        onRefresh();
      } else {
        toast.error("เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจว่าต้องการลบรายการนี้?")) return;
    try {
        const result = await deleteMenuItem(id);
        if (result.success) {
            toast.success("ลบรายการแล้ว");
            onRefresh();
        } else {
            toast.error("เกิดข้อผิดพลาด");
        }
    } catch (error) {
        console.error(error);
        toast.error("เกิดข้อผิดพลาด");
    }
  };

  if (filteredItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500 h-96">
        <div className="bg-gray-100 rounded-full p-6 mb-4">
          <span className="text-4xl">🍽️</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900">ยังไม่มีรายการอาหาร</h3>
        <p className="max-w-xs mx-auto mt-2">
          เลือก &quot;เพิ่มรายการอาหาร&quot; เพื่อเริ่มสร้างเมนูของคุณ
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {filteredItems.map((item) => (
        <div
          key={item.id}
          className={`group relative bg-white rounded-xl border transition-all duration-200 hover:shadow-lg hover:border-orange-200 ${
            !item.is_available ? "opacity-75 grayscale-[0.5]" : ""
          }`}
        >
          {/* Status Badge */}
          {!item.is_available && (
            <div className="absolute top-3 left-3 z-10">
              <span className="bg-gray-900/80 text-white text-xs font-semibold px-2 py-1 rounded-md backdrop-blur-sm">
                หมดชั่วคราว
              </span>
            </div>
          )}

          {/* Image Aspect Ratio Container 4:3 */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-xl bg-gray-100">
            {item.image_url ? (
              <Image
                src={item.image_url}
                alt={item.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-300">
                <span className="text-4xl">📷</span>
              </div>
            )}
          </div>

          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-900 line-clamp-1" title={item.name}>
                {item.name}
              </h3>
              <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg text-sm whitespace-nowrap">
                ฿{item.price}
              </span>
            </div>
            
            <p className="text-gray-500 text-sm line-clamp-2 h-10 mb-4">
              {item.description || "ไม่มีคำอธิบาย"}
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${item.is_available ? "bg-green-500" : "bg-red-500"}`} />
                <span className="text-xs text-gray-500">
                  {item.is_available ? "พร้อมขาย" : "หมด"}
                </span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit className="w-4 h-4 mr-2" />
                    แก้ไข
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="w-4 h-4 mr-2" />
                    ทำซ้ำ
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleToggleAvailability(item)}>
                    {item.is_available ? (
                         <>
                            <EyeOff className="w-4 h-4 mr-2" />
                            ระบุว่าหมด
                         </>
                    ) : (
                         <>
                            <Eye className="w-4 h-4 mr-2" />
                            เปิดขาย
                         </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600 focus:text-red-700 focus:bg-red-50"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    ลบ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
