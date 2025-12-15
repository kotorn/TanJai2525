import { createClient } from '@supabase/supabase-js';
import KDSBoard from '@/features/kds/components/kds-board';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // Using Anon key for reading public orders (or assume RLS allows it)

async function getActiveOrders(tenantSlug: string) {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Resolve Tenant
    const { data: tenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', tenantSlug)
        .single();

    if (!tenant) return { tenantId: null, orders: [] };

    // 2. Fetch Active Orders with Items
    // Requires nested query. Supabase JS supports this format.
    const { data: orders } = await supabase
        .from('orders')
        .select(`
            *,
            order_items (
                quantity,
                menu_items ( name )
            )
        `)
        .eq('tenant_id', tenant.id)
        .neq('status', 'completed')
        .neq('status', 'cancelled')
        .order('created_at', { ascending: true });

    return { tenantId: tenant.id, orders: orders || [] };
}

export default async function KDSPage({ params }: { params: { tenant: string } }) {
    const { tenant: tenantSlug } = await params;
    const { tenantId, orders } = await getActiveOrders(tenantSlug);

    if (!tenantId) return <div>Tenant not found</div>;

    return (
        <div className="min-h-screen bg-gray-100">
            <KDSBoard initialOrders={orders} tenantId={tenantId} />
        </div>
    );
}
