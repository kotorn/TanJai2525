"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryList } from "@/features/menu/components/CategoryList";
import { MenuList } from "@/features/menu/components/MenuList";
import { CreateCategoryModal } from "@/features/menu/components/CreateCategoryModal";
import { CreateMenuItemModal } from "@/features/menu/components/CreateMenuItemModal";
import { getMenuData, Category, MenuItem } from "@/features/menu/actions";
import { toast } from "sonner";

export default function MenuPage() {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const { categories, items } = await getMenuData();
      setCategories(categories);
      setMenuItems(items);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load menu data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            จัดการเมนูอาหาร
          </h1>
          <p className="text-gray-500 mt-1">
            จัดการหมวดหมู่และรายการอาหารของคุณ
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setIsCategoryModalOpen(true)}
            className="border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มหมวดหมู่
          </Button>
          <Button
            onClick={() => setIsMenuModalOpen(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มรายการอาหาร
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar: Categories */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-50 bg-gray-50/50">
              <h2 className="font-semibold text-gray-900">หมวดหมู่</h2>
            </div>
            <CategoryList
              categories={categories}
              items={menuItems}
              selectedId={selectedCategoryId}
              onSelect={setSelectedCategoryId}
              onRefresh={loadData}
            />
          </div>
        </div>

        {/* Main Content: Menu Items */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[600px]">
             <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h2 className="font-semibold text-gray-900">
                {selectedCategoryId 
                  ? categories.find(c => c.id === selectedCategoryId)?.name || "รายการในหมวดหมู่" 
                  : "รายการทั้งหมด"}
              </h2>
            </div>
            {isLoading ? (
              <div className="p-12 text-center text-gray-500">กำลังโหลด...</div>
            ) : (
              <MenuList 
                items={menuItems}
                categoryId={selectedCategoryId} 
                onRefresh={loadData}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateCategoryModal
        open={isCategoryModalOpen}
        onOpenChange={setIsCategoryModalOpen}
        onSuccess={loadData}
      />
      <CreateMenuItemModal
        open={isMenuModalOpen}
        onOpenChange={setIsMenuModalOpen}
        defaultCategoryId={selectedCategoryId}
        categories={categories}
        onSuccess={loadData}
      />
    </div>
  );
}
