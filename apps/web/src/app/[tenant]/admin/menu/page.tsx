'use client';

import { getMenuData, deleteMenuItem, MenuItem, Category } from "@/features/menu/actions";
import { MenuDataTable } from "@/features/menu/components/MenuDataTable";
import { MenuItemModal } from "@/features/menu/components/MenuItemModal";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AdminMenuPage({ params }: { params: { tenant: string } }) {
    // We need to fetch data. In client comp, we effect it or use SWR. 
    // Or we can simple call the server action in useEffect since it returns data.
    
    const [categories, setCategories] = useState<Category[]>([]);
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
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
        </div>
    );
}
