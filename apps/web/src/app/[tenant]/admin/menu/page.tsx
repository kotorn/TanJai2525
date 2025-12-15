'use client';

import { getMenuData, deleteMenuItem, MenuItem, Category } from "@/features/menu/actions";
import { MenuDataTable } from "@/features/menu/components/MenuDataTable";
import { MenuItemModal } from "@/features/menu/components/MenuItemModal";
import { CategoryModal } from "@/features/menu/components/CategoryModal";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AdminMenuPage({ params }: { params: { tenant: string } }) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

    const router = useRouter();

    const loadData = useCallback(async () => {
        try {
            const data = await getMenuData(params.tenant);
            setCategories(data.categories);
            setItems(data.items);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load menu data");
        } finally {
            setLoading(false);
        }
    }, [params.tenant]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleCreate = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleCreateCategory = () => {
        setIsCategoryModalOpen(true);
    };

    const handleEdit = (item: MenuItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (item: MenuItem) => {
        if (!confirm(`Delete "${item.name}"?`)) return;
        
        try {
            const res = await deleteMenuItem(item.id);
            if (res.success) {
                toast.success("Item deleted");
                loadData();
                router.refresh();
            } else {
                toast.error("Failed to delete");
            }
        } catch (error) {
            toast.error("Error deleting item");
        }
    };

    if (loading) return <div className="p-8">Loading menu...</div>;

    return (
        <div className="p-6 h-full flex flex-col">
            <header className="mb-6 flex justify-between items-center">
                <div>
                     <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
                     <p className="text-sm text-gray-500">Manage your restaurant menu items</p>
                </div>
            </header>

            <div className="flex-1 bg-white rounded-lg border shadow-sm p-4 overflow-hidden flex flex-col">
                <MenuDataTable 
                    data={items}
                    categories={categories}
                    onCreate={handleCreate}
                    onCreateCategory={handleCreateCategory}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>

            <MenuItemModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                tenantSlug={params.tenant}
                categories={categories}
                itemToEdit={editingItem}
                onSuccess={() => {
                    loadData();
                    router.refresh();
                }}
            />

            <CategoryModal
                open={isCategoryModalOpen}
                onOpenChange={setIsCategoryModalOpen}
                tenantSlug={params.tenant}
                onSuccess={() => {
                    loadData();
                    router.refresh();
                }}
            />
        </div>
    );
}
