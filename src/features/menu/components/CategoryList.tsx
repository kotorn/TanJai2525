"use client";

import { useState } from "react";
import { createCategory, deleteCategory } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Trash2, GripVertical } from "lucide-react";

type Category = {
    id: string;
    name: string;
    sort_order: number;
};

export default function CategoryList({ categories }: { categories: Category[] }) {
    const [newCatName, setNewCatName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!newCatName.trim()) return;
        setLoading(true);
        const res = await createCategory({ name: newCatName, sort_order: categories.length });
        setLoading(false);
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Category added");
            setNewCatName("");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this category? Items will be hidden (orphaned).")) return;
        const res = await deleteCategory(id);
        if (res.error) toast.error(res.error);
        else toast.success("Category deleted");
    };

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Input
                        placeholder="New Category"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        disabled={loading}
                    />
                    <Button onClick={handleCreate} disabled={loading}>Add</Button>
                </div>
                <div className="space-y-2">
                    {categories.map((cat) => (
                        <div key={cat.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                            <div className="flex items-center gap-2">
                                <GripVertical className="text-muted-foreground size-4 cursor-grab" />
                                <span>{cat.name}</span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)}>
                                <Trash2 className="size-4 text-red-500" />
                            </Button>
                        </div>
                    ))}
                    {categories.length === 0 && <p className="text-muted-foreground text-sm">No categories yet.</p>}
                </div>
            </CardContent>
        </Card>
    );
}
