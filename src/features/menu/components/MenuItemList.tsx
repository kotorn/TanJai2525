"use client";

import { createMenuItem, deleteMenuItem, updateMenuItem } from "../actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload, Image as ImageIcon } from "lucide-react";
import { uploadRestaurantAsset } from "@/lib/supabase/storage";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import OptionGroupManager from "./OptionGroupManager";
import { OptionGroup } from "../types";

type Category = { id: string; name: string };
type MenuItem = {
    id: string;
    name: string;
    price: number;
    category_id: string
    image_url?: string;
    description?: string;
    is_available: boolean;
    options?: any;
};

export default function MenuItemList({
    categories,
    items: initialItems
}: {
    categories: Category[];
    items: MenuItem[]
}) {
    const [items, setItems] = useState<MenuItem[]>(initialItems);
    const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.id || "");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

    // Form State (Create)
    const [newItemName, setNewItemName] = useState("");
    const [newItemPrice, setNewItemPrice] = useState("");
    const [newItemImage, setNewItemImage] = useState("");

    // Form State (Edit)
    const [editItemName, setEditItemName] = useState("");
    const [editItemPrice, setEditItemPrice] = useState("");
    const [editItemDesc, setEditItemDesc] = useState("");
    const [editItemImage, setEditItemImage] = useState("");
    const [editItemAvailable, setEditItemAvailable] = useState(true);
    const [editItemOptions, setEditItemOptions] = useState<OptionGroup[]>([]);

    useEffect(() => {
        setItems(initialItems);
    }, [initialItems]);

    useEffect(() => {
        if (editingItem) {
            setEditItemName(editingItem.name);
            setEditItemPrice(editingItem.price.toString());
            setEditItemDesc(editingItem.description || "");
            setEditItemImage(editingItem.image_url || "");
            setEditItemAvailable(editingItem.is_available);
            
            // Parse options if valid, else empty array
            let opts: OptionGroup[] = [];
            if (editingItem.options && Array.isArray(editingItem.options)) {
                opts = editingItem.options;
            }
            setEditItemOptions(opts);
        }
    }, [editingItem]);

    const filteredItems = items.filter(item => item.category_id === selectedCategory);

    const handleCreate = async () => {
        if (!newItemName || !newItemPrice || !selectedCategory) return;

        const res = await createMenuItem({
            name: newItemName,
            price: parseFloat(newItemPrice),
            category_id: selectedCategory,
            image_url: newItemImage,
        });

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Item created");
            setIsCreateDialogOpen(false);
            setNewItemName("");
            setNewItemPrice("");
            setNewItemImage("");
        }
    };

    const handleUpdate = async () => {
        if (!editingItem || !editItemName || !editItemPrice) return;

        const res = await updateMenuItem(editingItem.id, {
            name: editItemName,
            price: parseFloat(editItemPrice),
            description: editItemDesc,
            image_url: editItemImage,
            is_available: editItemAvailable,
            options: editItemOptions
        });

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Item updated");
            setIsEditDialogOpen(false);
            setEditingItem(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete item?")) return;
        const res = await deleteMenuItem(id);
        if (res.error) toast.error(res.error);
        else toast.success("Item deleted");
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const publicUrl = await uploadRestaurantAsset(file, "restaurant-assets"); // Reuse bucket
            if (isEdit) {
                setEditItemImage(publicUrl);
            } else {
                setNewItemImage(publicUrl);
            }
            toast.success("Image uploaded");
        } catch (error) {
            console.error("Upload failed", error);
            toast.error("Upload failed");
        }
    };

    if (categories.length === 0) {
        return <div className="text-muted-foreground p-4">Create a category first to add items.</div>;
    }

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Menu Items</CardTitle>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm"><Plus className="size-4 mr-2" /> Add Item</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Item</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="flex justify-center">
                                <label className="cursor-pointer block relative w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 hover:border-orange-500 overflow-hidden bg-gray-50">
                                    {newItemImage ? (
                                        <img src={newItemImage} className="w-full h-full object-cover" alt="Preview" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                            <Upload className="w-6 h-6 mb-1" />
                                            <span className="text-[10px]">Photo</span>
                                        </div>
                                    )}
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, false)} />
                                </label>
                            </div>
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="Pad Thai" />
                            </div>
                            <div className="space-y-2">
                                <Label>Price (฿)</Label>
                                <Input type="number" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} placeholder="60" />
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <select
                                    className="bg-background border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <Button onClick={handleCreate} className="w-full">Create Item</Button>
                    </DialogContent>
                </Dialog>

                {/* Edit Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={(open) => !open && setIsEditDialogOpen(false)}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Edit Item</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                             <div className="flex justify-center">
                                <label className="cursor-pointer block relative w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 hover:border-orange-500 overflow-hidden bg-gray-50">
                                    {editItemImage ? (
                                        <img src={editItemImage} className="w-full h-full object-cover" alt="Preview" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                            <ImageIcon className="w-8 h-8 mb-2" />
                                            <span className="text-xs">Change Photo</span>
                                        </div>
                                    )}
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, true)} />
                                </label>
                            </div>
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input value={editItemName} onChange={e => setEditItemName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input value={editItemDesc} onChange={e => setEditItemDesc(e.target.value)} placeholder="Delicious..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Price (฿)</Label>
                                    <Input type="number" value={editItemPrice} onChange={e => setEditItemPrice(e.target.value)} />
                                </div>
                                <div className="space-y-2 flex flex-col justify-end pb-2">
                                    <div className="flex items-center space-x-2">
                                        <Switch 
                                            id="available" 
                                            checked={editItemAvailable}
                                            onCheckedChange={setEditItemAvailable}
                                        />
                                        <Label htmlFor="available">Available</Label>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t">
                                <OptionGroupManager 
                                    value={editItemOptions}
                                    onChange={setEditItemOptions}
                                />
                            </div>

                        </div>
                        <Button onClick={handleUpdate} className="w-full">Save Changes</Button>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
                    <TabsList className="w-full justify-start overflow-auto">
                        {categories.map(cat => (
                            <TabsTrigger key={cat.id} value={cat.id}>{cat.name}</TabsTrigger>
                        ))}
                    </TabsList>
                    {categories.map(cat => (
                        <TabsContent key={cat.id} value={cat.id} className="mt-4 space-y-2">
                            {filteredItems.length === 0 && <p className="text-muted-foreground text-sm">No items in this category.</p>}
                            {filteredItems.map(item => (
                                <div key={item.id} className="flex justify-between items-start border rounded p-3 bg-card hover:bg-accent/5 transition-colors">
                                    <div className="flex gap-3">
                                        {item.image_url ? (
                                            <div className="w-16 h-16 relative rounded-md overflow-hidden flex-shrink-0">
                                                <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                                            </div>
                                        ) : (
                                            <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center flex-shrink-0 text-muted-foreground">
                                                <ImageIcon className="w-6 h-6 opaciy-20" />
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-medium flex items-center gap-2">
                                                {item.name}
                                                {!item.is_available && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Out of Stock</span>}
                                            </div>
                                            <div className="text-xs text-muted-foreground line-clamp-1">{item.description}</div>
                                            <div className="text-sm font-semibold mt-1">฿{item.price}</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => {
                                            setEditingItem(item);
                                            setIsEditDialogOpen(true);
                                        }}>
                                            <Pencil className="size-4 text-blue-500" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                                            <Trash2 className="size-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
    );
}
