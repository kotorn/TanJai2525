'use client';

import { useState } from 'react';
import { addMenuItem } from '@/features/admin/actions';
import { toast } from 'sonner';

export default function AdminMenuPage({ params }: { params: { tenant: string } }) {
    // Normally we would verify auth here via middleware or check session
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('Main');
    const [isLoading, setIsLoading] = useState(false);

    // In a real app we'd fetch the tenantId properly.
    // For now we rely on the middleware injection or params lookup.
    // But wait, params.tenant is the SLUG. We need the ID for the DB insert.
    // We should probably handle ID resolution in the Server Action or fetch it here.
    // To keep it simple for the E2E script, let's assume the Server Action resolves it 
    // OR we pass the SLUG to the action and it resolves it.

    // Let's modify the action to accept Slug for easier usage, or resolve it here.
    // Actually, for the E2E, we can just resolve it in the action if we change the signature.
    // But strictly, we should probably pass the ID. 
    // Let's assume there is a layout that provides context, but we are just making a page.
    // Let's just pass the Slug to the action and let it resolve. 
    // *Self-Correction*: I'll update the action to resolve slug -> id to be robust.

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const res = await addMenuItem(params.tenant, name, parseFloat(price), category);

        if (res.success) {
            toast.success('Menu item added');
            setName('');
            setPrice('');
        } else {
            toast.error('Failed: ' + res.error);
        }
        setIsLoading(false);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Menu Management</h1>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow max-w-md space-y-4">
                <div>
                    <label className="block text-sm font-bold mb-1">Item Name</label>
                    <input
                        value={name} onChange={e => setName(e.target.value)}
                        className="w-full border p-2 rounded" placeholder="e.g. Som Tum" required
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold mb-1">Price (THB)</label>
                    <input
                        type="number" value={price} onChange={e => setPrice(e.target.value)}
                        className="w-full border p-2 rounded" placeholder="50" required
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold mb-1">Category</label>
                    <select
                        value={category} onChange={e => setCategory(e.target.value)}
                        className="w-full border p-2 rounded"
                    >
                        <option>Main</option>
                        <option>Appetizer</option>
                        <option>Drink</option>
                        <option>Dessert</option>
                    </select>
                </div>

                <button
                    type="submit" disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700"
                >
                    {isLoading ? 'Adding...' : 'Add Item'}
                </button>
            </form>
        </div>
    );
}
