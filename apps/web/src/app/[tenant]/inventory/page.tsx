import { createClient } from '@/lib/supabase/server';
import { validateTenantOwnership } from '@/lib/tenant-auth';
import { Plus, AlertTriangle, Package } from 'lucide-react';
import { addIngredient } from '@/features/inventory/actions/inventory';
import InventoryTable from '@/features/inventory/components/inventory-table';

export default async function InventoryPage({ params }: { params: { tenant: string } }) {
    const { tenant } = await validateTenantOwnership(params.tenant);
    const supabase = createClient();

    // Fetch Ingredients
    const { data: ingredients } = await supabase
        .from('ingredients')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('name');

    // Server Action for Adding
    async function handleAdd(formData: FormData) {
        'use server';
        const name = formData.get('name') as string;
        const unit = formData.get('unit') as string;
        const stock = parseFloat(formData.get('stock') as string);
        const minStock = parseFloat(formData.get('min_stock') as string);
        const cost = parseFloat(formData.get('cost') as string);

        await addIngredient(tenant.id, { name, unit, stock, minStock, cost });
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Package className="text-orange-500" /> Inventory Management
                    </h1>
                    <p className="text-gray-500">Track stock levels and costs</p>
                </div>

                {/* Add Ingredient Dialog/Modal - simplified as inline form for MVP or use a Client Component for Modal */}
                {/* For MVP let's do a Client Component wrapper for the table + "Add" button modal */}
            </div>

            {/* Client Component for Interactivity */}
            <InventoryTable
                initialIngredients={ingredients || []}
                tenantId={tenant.id}
            />
        </div>
    );
}
