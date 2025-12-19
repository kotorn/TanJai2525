import { fetchKitchenOrders } from '@/features/kds/actions';
import { KitchenBoard } from '@/features/kds/components/KitchenBoard';
import { notFound } from 'next/navigation';
import { FeatureGate } from '@/components/saas/FeatureGate'; // Import FeatureGate

// Force dynamic because KDS depends on realtime DB state
export const dynamic = 'force-dynamic';

export default async function KitchenPage({ params }: { params: { tenant: string } }) {
  if (!params.tenant) return notFound();

  // Initial Data Fetch
  const orders = await fetchKitchenOrders(params.tenant);

  return (
    <div className="h-screen bg-[#121212] flex flex-col font-sans">
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#1a1a1a]">
        <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <h1 className="font-bold text-xl text-white tracking-tight">KITCHEN DISPLAY SYSTEM</h1>
        </div>
        <div className="text-gray-400 text-sm font-mono">
            {new Date().toLocaleDateString()}
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden">
        <FeatureGate feature="module:kds">
            <KitchenBoard initialOrders={orders} tenantId={params.tenant} />
        </FeatureGate>
      </main>
    </div>
  );
}
