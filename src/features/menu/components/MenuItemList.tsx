"use client";

import { createMenuItem, deleteMenuItem } from "../actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";

type Category = { id: string; name: string };
type MenuItem = {
    id: string;
    name: string;
    price: number;
    category_id: string
    image_url?: string;
    is_available: boolean;
};

export default function MenuItemList({
    categories,
    items
}: {
    categories: Category[];
    items: MenuItem[]
}) {
    const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.id || "");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form State
    const [newItemName, setNewItemName] = useState("");
    const [newItemPrice, setNewItemPrice] = useState("");

    const filteredItems = items.filter(item => item.category_id === selectedCategory);

    const handleCreate = async () => {
        if (!newItemName || !newItemPrice || !selectedCategory) return;

        const res = await createMenuItem({
            name: newItemName,
            price: parseFloat(newItemPrice),
            category_id: selectedCategory,
        });

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Item created");
            setIsDialogOpen(false);
            setNewItemName("");
            setNewItemPrice("");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete item?")) return;
        const res = await deleteMenuItem(id);
        if (res.error) toast.error(res.error);
        else toast.success("Item deleted");
    };

    if (categories.length === 0) {
        return <div className="text-muted-foreground p-4">Create a category first to add items.</div>;
    }

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Menu Items</CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm"><Plus className="size-4 mr-2" /> Add Item</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Item</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
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
                        <Button onClick={handleCreate} className="w-full">Save Item</Button>
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
                                <div key={item.id} className="flex justify-between border rounded p-3">
                                    <div>
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-sm text-gray-500">฿{item.price}</div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>Delete</Button>
                                </div>
                            ))}
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
    );
}
