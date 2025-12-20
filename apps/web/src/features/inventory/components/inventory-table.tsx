'use client';

import { useState } from 'react';
import { Plus, Edit2, History, AlertCircle } from 'lucide-react';
import { addIngredient, updateStock } from '../actions/inventory';
import { toast } from 'sonner';

export default function InventoryTable({ initialIngredients, tenantId }: { initialIngredients: any[], tenantId: string }) {
    const [ingredients, setIngredients] = useState(initialIngredients);
    const [isAddOpen, setIsAddOpen] = useState(false);

    async function onAddSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name') as string,
            unit: formData.get('unit') as string,
            cost: parseFloat(formData.get('cost') as string),
            stock: parseFloat(formData.get('stock') as string),
            minStock: parseFloat(formData.get('min_stock') as string)
        };

        try {
            await addIngredient(tenantId, data);
            toast.success('Ingredient Added');
            setIsAddOpen(false);
            window.location.reload(); // Lazy reload for now
        } catch (err: any) {
            toast.error(err.message);
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-100 flex justify-between">
                <h3 className="font-semibold text-gray-700">Stock Items</h3>
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-800"
                >
                    <Plus size={16} /> Add Item
                </button>
            </div>

            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                    <tr>
                        <th className="p-4">Name</th>
                        <th className="p-4">Stock Level</th>
                        <th className="p-4">Unit Cost</th>
                        <th className="p-4 text-right">Value</th>
                        <th className="p-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {ingredients.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                            <td className="p-4 font-medium text-gray-900">{item.name}</td>
                            <td className="p-4">
                                <div className="flex items-center gap-2">
                                    <span className={item.current_stock <= item.min_stock_level ? 'text-red-500 font-bold' : ''}>
                                        {item.current_stock} {item.unit}
                                    </span>
                                    {item.current_stock <= item.min_stock_level && (
                                        <AlertCircle size={14} className="text-red-500" />
                                    )}
                                </div>
                            </td>
                            <td className="p-4">฿{item.cost_per_unit}</td>
                            <td className="p-4 text-right">฿{(item.current_stock * item.cost_per_unit).toFixed(2)}</td>
                            <td className="p-4 text-right">
                                <button className="text-blue-600 hover:text-blue-800 text-sm">Adjust</button>
                            </td>
                        </tr>
                    ))}
                    {ingredients.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-400">
                                No ingredients found. Add one to start tracking.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Add Modal (Simple Overlay) */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold mb-4">Add Ingredient</h2>
                        <form onSubmit={onAddSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Name</label>
                                <input name="name" required className="w-full border rounded-lg p-2" placeholder="e.g. Jasmine Rice" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Unit</label>
                                    <select name="unit" className="w-full border rounded-lg p-2">
                                        <option value="kg">kg</option>
                                        <option value="g">g</option>
                                        <option value="l">liter</option>
                                        <option value="ml">ml</option>
                                        <option value="pack">pack</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Cost per Unit</label>
                                    <input name="cost" type="number" step="0.01" required className="w-full border rounded-lg p-2" placeholder="0.00" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Current Stock</label>
                                    <input name="stock" type="number" step="0.001" required className="w-full border rounded-lg p-2" placeholder="0" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Min Level (Alert)</label>
                                    <input name="min_stock" type="number" step="0.001" required className="w-full border rounded-lg p-2" placeholder="5" />
                                </div>
                            </div>
                            <div className="flex gap-2 mt-6">
                                <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 py-2 rounded-lg font-medium text-gray-700">Cancel</button>
                                <button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700 py-2 rounded-lg font-medium text-white">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
