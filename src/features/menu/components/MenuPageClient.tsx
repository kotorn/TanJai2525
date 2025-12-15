"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Category, MenuItem, deleteMenuItem } from "@/features/menu/actions";
import { CategoryList } from "./CategoryList";
import { MenuDataTable } from "./MenuDataTable";
import { CreateCategoryModal } from "./CreateCategoryModal";
import { MenuItemModal } from "./MenuItemModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface MenuPageClientProps {
  initialCategories: Category[];
  initialItems: MenuItem[];
}

export function MenuPageClient({ initialCategories, initialItems }: MenuPageClientProps) {
  const router = useRouter();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  
  // Item Modal State
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const handleRefresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const handleCreateItem = () => {
    setEditingItem(null);
    setIsItemModalOpen(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setIsItemModalOpen(true);
  };

  const handleDeleteItem = async (item: MenuItem) => {
    if (!confirm(`คุณแน่ใจว่าต้องการลบเมนู "${item.name}"?`)) return;
    
    try {
        const result = await deleteMenuItem(item.id);
        if (result.success) {
            toast.success("ลบรายการแล้ว");
            handleRefresh();
        } else {
            toast.error(result.error || "เกิดข้อผิดพลาดในการลบ");
        }
    } catch (error) {
        console.error(error);
        toast.error("เกิดข้อผิดพลาด");
    }
  };

  const filteredItems = selectedCategoryId
    ? initialItems.filter((item) => item.category_id === selectedCategoryId)
    : initialItems;

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-gray-50">
      {/* Sidebar: Categories */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col pt-6 hidden md:flex">
        <div className="px-4 pb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">หมวดหมู่</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            onClick={() => setIsCategoryModalOpen(true)}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <CategoryList
            categories={initialCategories}
            items={initialItems}
            selectedId={selectedCategoryId}
            onSelect={setSelectedCategoryId}
            onRefresh={handleRefresh}
          />
        </div>
      </div>

      {/* Main Content: Items */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedCategoryId 
                ? initialCategories.find(c => c.id === selectedCategoryId)?.name 
                : "รายการอาหารทั้งหมด"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              จัดการรายการอาหาร ราคา และสถานะ
            </p>
          </div>
          
          <Button 
            className="bg-orange-600 hover:bg-orange-700 text-white gap-2 shadow-sm"
            onClick={handleCreateItem}
          >
            <Plus className="w-5 h-5" />
            เพิ่มรายการอาหาร
          </Button>
        </header>

        {/* Menu Items Table */}
        <div className="flex-1 overflow-y-auto p-6">
          <MenuDataTable 
            data={filteredItems}
            categories={initialCategories}
            onCreate={handleCreateItem}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
          />
        </div>
      </div>

      {/* Modals */}
      <CreateCategoryModal 
        open={isCategoryModalOpen}
        onOpenChange={setIsCategoryModalOpen}
        onSuccess={handleRefresh}
      />

      <MenuItemModal
        open={isItemModalOpen}
        onOpenChange={setIsItemModalOpen}
        defaultCategoryId={selectedCategoryId}
        categories={initialCategories}
        onSuccess={handleRefresh}
        itemToEdit={editingItem}
      />
    </div>
  );
}
