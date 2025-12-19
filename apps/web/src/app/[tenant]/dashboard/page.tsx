import { getDashboardMetrics, getTopItems } from '@/features/analytics/actions';
import { DashboardOverview } from '@/features/analytics/components/DashboardOverview';
import { FeatureGate } from '@/components/saas/FeatureGate';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({ params }: { params: { tenant: string } }) {
    if (!params.tenant) return notFound();

    const metrics = await getDashboardMetrics(params.tenant);
    const topItems = await getTopItems(params.tenant);

    return (
        <div className="min-h-screen bg-[#121212] font-sans">
             <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#1a1a1a]">
                <div>
                     <h1 className="text-2xl font-bold text-white tracking-tight">Executive Dashboard</h1>
                     <p className="text-gray-500 text-sm">Real-time Business Intelligence</p>
                </div>
                <div className="flex items-center gap-4">
                     <div className="bg-amber-500/10 text-amber-500 px-4 py-2 rounded-full text-sm font-medium border border-amber-500/20">
                        Pro Plan Active
                     </div>
                </div>
             </header>

             <main>
                <FeatureGate feature="module:analytics" showOverlay>
                    {metrics ? (
                         <DashboardOverview metrics={metrics} topItems={topItems} />
                    ) : (
                        <div className="p-8 text-center text-gray-500">Failed to load data.</div>
                    )}
                </FeatureGate>
             </main>
        </div>
    );
}
