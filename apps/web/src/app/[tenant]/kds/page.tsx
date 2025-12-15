import { createClient } from '@supabase/supabase-js';
import KDSBoard from '@/features/kds/components/kds-board';

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function getActiveOrders(tenantSlug: string) {
    const { db } = await import('@/lib/mock-db');
    
    // Assume tenant exists or check
    const tenant = db.tenants.find(t => t.slug === tenantSlug);
    // If not found, return empty or mock one
    const tenantId = tenant ? tenant.id : 'mock-tenant-id';

    const allOrders = db.getOrders(tenantId);
    
    // Filter for Active
    const orders = allOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled' && o.status !== 'paid')
        .sort((a, b) => a.created_at.localeCompare(b.created_at));

    return { tenantId, orders };
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
