'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { CategoryList } from './CategoryList';
import { MenuItemGrid } from './MenuItemGrid';
import { CategoryForm } from './forms/CategoryForm';
import { ItemForm } from './forms/ItemForm';
import { useToast } from "@tanjai/ui"; 
import { Loader2 } from 'lucide-react';
import { Toaster } from "@tanjai/ui"; 

type Category = Database['public']['Tables']['menu_categories']['Row'];
type MenuItem = Database['public']['Tables']['menu_items']['Row'];

export function MenuManager() {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initial Fetch
  useState(() => {
    fetchData();
  });

  async function fetchData() {
    setLoading(true);
    // Fetch Categories
    const { data: cats, error: catError } = await supabase
      .from('menu_categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (catError) console.error('Error fetching categories:', catError);
    else setCategories(cats || []);

    // Fetch Items
    const { data: menuItems, error: itemError } = await supabase
      .from('menu_items')
      .select('*')
      .order('sort_order', { ascending: true });

    if (itemError) console.error('Error fetching items:', itemError);
    else setItems(menuItems || []);

    setLoading(false);
  }

  // Categories
  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsCategoryDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsCategoryDialogOpen(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    const { error } = await supabase.from('menu_categories').delete().eq('id', id);
    if (error) {
        alert('Failed to delete category');
    } else {
        fetchData();
    }
  };

  const handleSubmitCategory = async (values: { name: string; sort_order: number }) => {
    setIsSubmitting(true);
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user');
        
        // TEMPORARY: fetch first restaurant ID available to user
        const { data: restaurants } = await supabase.from('restaurants').select('id').limit(1);
        const restaurantId = restaurants?.[0]?.id;

        if (!restaurantId) {
            alert('No restaurant found for this user.');
            setIsSubmitting(false);
            return;
        }

        if (editingCategory) {
            const { error } = await supabase
                .from('menu_categories')
                .update({ name: values.name, sort_order: values.sort_order })
                .eq('id', editingCategory.id);
            if (error) throw error;
        } else {
            const { error } = await supabase
                .from('menu_categories')
                .insert({ 
                    name: values.name, 
                    sort_order: values.sort_order,
                    restaurant_id: restaurantId 
                });
            if (error) throw error;
        }
        setIsCategoryDialogOpen(false);
        fetchData();
    } catch (error) {
        console.error(error);
        alert('Error saving category');
    } finally {
        setIsSubmitting(false);
    }
  };

  // Items
  const handleAddItem = () => {
    if (categories.length === 0) {
        alert('Please create a category first');
        return;
    }
    setEditingItem(null);
    setIsItemDialogOpen(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setIsItemDialogOpen(true);
  };

  const handleDeleteItem = async (item: MenuItem) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    const { error } = await supabase.from('menu_items').delete().eq('id', item.id);
    if (error) alert('Failed to delete item');
    else fetchData();
  };

  const handleSubmitItem = async (values: any) => {
     setIsSubmitting(true);
     try {
        const { data: restaurants } = await supabase.from('restaurants').select('id').limit(1);
        const restaurantId = restaurants?.[0]?.id;
        
        if (!restaurantId) {
            alert('No restaurant found');
            return;
        }

        let imageUrl = values.image_url;
        if (values.imageFile) {
            const fileExt = values.imageFile.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `menu-items/${fileName}`;
            
            const { error: uploadError } = await supabase.storage
                .from('menu_images') // Ensure this bucket exists
                .upload(filePath, values.imageFile);

            if (uploadError) {
                console.warn('Image upload failed, proceeding without new image update', uploadError);
            } else {
                const { data: publicUrlData } = supabase.storage
                    .from('menu_images')
                    .getPublicUrl(filePath);
                imageUrl = publicUrlData.publicUrl;
            }
        }

        const itemData = {
            name: values.name,
            description: values.description,
            price: values.price,
            category_id: values.category_id, 
            is_available: values.is_available,
            image_url: imageUrl,
            restaurant_id: restaurantId,
            sort_order: 0, 
        };

        if (editingItem) {
             const { error } = await supabase
                .from('menu_items')
                .update(itemData)
                .eq('id', editingItem.id);
             if (error) throw error;
        } else {
             const { error } = await supabase
                .from('menu_items')
                .insert(itemData);
             if (error) throw error;
        }
        setIsItemDialogOpen(false);
        fetchData();
     } catch (error) {
         console.error(error);
         alert('Error saving item');
     } finally {
         setIsSubmitting(false);
     }
  };

  const filteredItems = selectedCategoryId
    ? items.filter(item => item.category_id === selectedCategoryId)
    : items;

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="flex h-[calc(100vh-4rem)]">
        <CategoryList 
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
            onEdit={handleEditCategory}
            onDelete={handleDeleteCategory}
            onAdd={handleAddCategory}
        />
        <div className="flex-1 flex flex-col bg-slate-50">
            <div className="p-4 border-b bg-white flex justify-between items-center">
                <h1 className="text-xl font-bold">
                    {selectedCategoryId 
                        ? categories.find(c => c.id === selectedCategoryId)?.name 
                        : 'All Menu Items'}
                </h1>
                <Button onClick={handleAddItem}>
                    Add Item
                </Button>
            </div>
            <MenuItemGrid 
                items={filteredItems}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
            />
        </div>

        <CategoryForm 
            isOpen={isCategoryDialogOpen}
            onClose={() => setIsCategoryDialogOpen(false)}
            initialData={editingCategory}
            onSubmit={handleSubmitCategory}
            isSubmitting={isSubmitting}
        />

        <ItemForm
            isOpen={isItemDialogOpen}
            onClose={() => setIsItemDialogOpen(false)}
            initialData={editingItem}
            categories={categories}
            onSubmit={handleSubmitItem}
            isSubmitting={isSubmitting}
        />
        <Toaster />
    </div>
  );
}
