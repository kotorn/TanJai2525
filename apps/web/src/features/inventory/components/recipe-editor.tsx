'use client';

import { useState } from 'react';
import { Plus, Trash2, Calculator } from 'lucide-react';
import { addRecipeItem, removeRecipeItem } from '@/features/inventory/actions/recipes';
import { toast } from 'sonner';

interface Ingredient {
    id: string;
    name: string;
    unit: string;
    cost_per_unit: number;
}

interface RecipeItem {
    id: string;
    quantity_required: number;
    ingredient: any; // Using any for joined data simplification
}

export default function RecipeEditor({
    menuItemId,
    initialRecipe,
    allIngredients
}: {
    menuItemId: string;
    initialRecipe: any[];
    allIngredients: Ingredient[];
}) {
    const [recipe, setRecipe] = useState(initialRecipe);
    const [selectedIngId, setSelectedIngId] = useState('');
    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Calculate Total Cost
    const totalCost = recipe.reduce((sum, item) => {
        return sum + (item.quantity_required * (item.ingredient?.cost_per_unit || 0));
    }, 0);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedIngId || !amount) return;

        setIsSubmitting(true);
        try {
            await addRecipeItem(menuItemId, selectedIngId, parseFloat(amount));
            toast.success('Ingredient added');
            // Optimistic update or reload. Reload is safer for ID syncing.
            window.location.reload();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemove = async (id: string) => {
        if (!confirm('Remove this ingredient?')) return;
        try {
            await removeRecipeItem(id);
            setRecipe(prev => prev.filter(item => item.id !== id));
            toast.success('Removed');
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                {/* Recipe List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-700">Ingredients in Dish</h3>
                        <span className="text-sm text-gray-500">{recipe.length} items</span>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {recipe.map((item) => (
                            <div key={item.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                                <div>
                                    <div className="font-medium text-gray-900">{item.ingredient.name}</div>
                                    <div className="text-sm text-gray-500">
                                        {item.quantity_required} {item.ingredient.unit} × ฿{item.ingredient.cost_per_unit}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="font-mono text-gray-700">
                                        ฿{(item.quantity_required * item.ingredient.cost_per_unit).toFixed(2)}
                                    </div>
                                    <button
                                        onClick={() => handleRemove(item.id)}
                                        className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {recipe.length === 0 && (
                            <div className="p-8 text-center text-gray-400">
                                No ingredients linked yet.
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                        <span className="font-semibold text-gray-700 flex items-center gap-2">
                            <Calculator size={18} /> Total Cost
                        </span>
                        <span className="text-xl font-bold text-green-600">
                            ฿{totalCost.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {/* Add Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Add Ingredient</h3>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ingredient</label>
                            <select
                                className="w-full border rounded-lg p-2.5 bg-gray-50"
                                value={selectedIngId}
                                onChange={(e) => setSelectedIngId(e.target.value)}
                                required
                            >
                                <option value="">Select an ingredient...</option>
                                {allIngredients.map(ing => (
                                    <option key={ing.id} value={ing.id}>
                                        {ing.name} ({ing.unit})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Required</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.001"
                                    className="w-full border rounded-lg p-2.5 pl-4"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                />
                                {selectedIngId && (
                                    <span className="absolute right-3 top-2.5 text-gray-400 text-sm">
                                        {allIngredients.find(i => i.id === selectedIngId)?.unit}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Amount used per single recipe serving.</p>
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            <Plus size={18} /> Add to Dish
                        </button>
                    </form>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                    <p className="font-bold mb-1">💡 Pro Tip</p>
                    <p>
                        Accurate recipes allow the system to calculate your <strong>Gross Margin</strong> and warn you when you're running low on stock automatically.
                    </p>
                </div>
            </div>
        </div>
    );
}
