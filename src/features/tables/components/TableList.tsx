"use client";

import { useState } from "react";
import { Table } from "@/types/database.types";
import { createTable, deleteTable } from "../actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Users, MapPin } from "lucide-react";
import TableQRCode from "./TableQRCode";

export default function TableList({ tables }: { tables: Table[] }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [newCapacity, setNewCapacity] = useState("2");
    const [newLocation, setNewLocation] = useState("");

    const handleCreate = async () => {
        if (!newName || !newCapacity) return;

        const res = await createTable({
            name: newName,
            capacity: parseInt(newCapacity),
            location: newLocation || undefined
        });

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Table created");
            setIsCreateOpen(false);
            setNewName("");
            setNewCapacity("2");
            setNewLocation("");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this table?")) return;
        const res = await deleteTable(id);
        if (res.error) toast.error(res.error);
        else toast.success("Table deleted");
    };

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Tables</CardTitle>
                 <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm"><Plus className="size-4 mr-2" /> Add Table</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Table</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Table Name / Number</Label>
                                <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="T-01" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Capacity (Pax)</Label>
                                    <Input type="number" value={newCapacity} onChange={e => setNewCapacity(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Location</Label>
                                    <Input value={newLocation} onChange={e => setNewLocation(e.target.value)} placeholder="Indoor" />
                                </div>
                            </div>
                        </div>
                        <Button onClick={handleCreate} className="w-full">Create Table</Button>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {tables.length === 0 && <p className="text-muted-foreground p-4">No tables yet.</p>}
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {tables.map(table => (
                        <div key={table.id} className="relative flex flex-col border rounded-lg p-4 bg-card hover:shadow-sm transition-shadow">
                             <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg">{table.name}</h3>
                                <div className="flex gap-1">
                                    <TableQRCode table={table} />
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(table.id)} className="text-muted-foreground hover:text-red-500">
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                             </div>
                             
                             <div className="flex items-center text-sm text-muted-foreground gap-2 mb-1">
                                <Users className="size-3" />
                                <span>{table.capacity} Pax</span>
                             </div>
                             {table.location && (
                                <div className="flex items-center text-sm text-muted-foreground gap-2">
                                    <MapPin className="size-3" />
                                    <span>{table.location}</span>
                                </div>
                             )}

                             <div className={`mt-3 text-xs font-medium px-2 py-1 rounded-full w-fit ${
                                 table.status === 'occupied' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                             }`}>
                                 {table.status.toUpperCase()}
                             </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
