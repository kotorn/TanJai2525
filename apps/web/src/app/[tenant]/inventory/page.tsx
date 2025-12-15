import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function getInventory(tenantSlug: string) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', tenantSlug).single();
    if (!tenant) return [];

    const { data } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('name');
    return data || [];
}

export default async function InventoryPage({ params }: { params: { tenant: string } }) {
    const { tenant: tenantSlug } = await params;
    const items = await getInventory(tenantSlug);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Inventory Management</h1>

            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-semibold">Item Name</th>
                            <th className="p-4 font-semibold">Stock</th>
                            <th className="p-4 font-semibold">Unit</th>
                            <th className="p-4 font-semibold">Cost/Unit</th>
                            <th className="p-4 font-semibold">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item: any) => (
                            <tr key={item.id} className="border-b hover:bg-gray-50">
                                <td className="p-4">{item.name}</td>
                                <td className="p-4 font-mono font-bold">{item.current_stock}</td>
                                <td className="p-4 text-gray-500">{item.unit}</td>
                                <td className="p-4">฿{item.cost_per_unit}</td>
                                <td className="p-4">
                                    {item.current_stock < item.min_stock_level ? (
                                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">Low Stock</span>
                                    ) : (
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">OK</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {items.length === 0 && (
                    <div className="p-8 text-center text-gray-400">No inventory items found.</div>
                )}
            </div>
        </div>
    );
}
