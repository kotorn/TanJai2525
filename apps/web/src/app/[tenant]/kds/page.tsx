import { createClient } from '@/lib/supabase/server';
import { validateTenantOwnership } from '@/lib/tenant-auth';
import { getSubscriptionStatus } from '@/features/subscription/actions';
import KDSBoard from '@/features/kds/components/kds-board';
import Link from 'next/link';

export default async function KDSPage({ params }: { params: { tenant: string } }) {
    const { tenant: tenantSlug } = params;

    // 1. Security Check (Auth & Ownership)
    const { tenant } = await validateTenantOwnership(tenantSlug);

    // 2. Paywall Check
    const { plan } = await getSubscriptionStatus(tenant.id);

    if (plan !== 'pro') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
                <div className="max-w-md text-center space-y-6">
                    <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <span className="text-4xl">👑</span>
                    </div>
                    <h1 className="text-3xl font-bold text-orange-400">Pro Feature</h1>
                    <p className="text-gray-300">
                        The Kitchen Display System (KDS) is available exclusively on the <span className="font-bold text-white">Pro Plan</span>.
                    </p>
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-left text-sm space-y-2">
                        <p className="flex items-center"><span className="text-green-400 mr-2">✓</span> Real-time Order Sync</p>
                        <p className="flex items-center"><span className="text-green-400 mr-2">✓</span> Multi-language Support (EN/MY/KM/LA)</p>
                        <p className="flex items-center"><span className="text-green-400 mr-2">✓</span> Paperless Workflow</p>
                    </div>
                    <Link
                        href={`/${tenantSlug}/settings/billing`}
                        className="block w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-lg transition-colors"
                    >
                        Upgrade Now
                    </Link>
                    <Link
                        href={`/${tenantSlug}/dashboard`}
                        className="block text-sm text-gray-500 hover:text-gray-400"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    // 3. Fetch Real Data
    const supabase = createClient();
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', tenant.id)
        .in('status', ['pending', 'processing', 'cooking', 'ready']) // Active orders
        .order('created_at', { ascending: true });

    if (error) {
        console.error("KDS Fetch Error:", error);
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 text-red-500">
                Error loading KDS data. Please try again.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <KDSBoard initialOrders={orders || []} tenantId={tenant.id} />
        </div>
    );
}
