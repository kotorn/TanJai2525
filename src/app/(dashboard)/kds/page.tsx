import RealtimeOrderList from "@/features/order/components/RealtimeOrderList";
import { fetchUnpaidOrders } from "@/features/order/actions";

export const dynamic = 'force-dynamic';

export default async function KDSPage() {
    const initialOrders = await fetchUnpaidOrders();

    return (
        <div className="flex h-full flex-col gap-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Kitchen Display System</h2>
            </div>
            {/* @ts-ignore - Supabase types vs placeholder types mismatch to be fixed in component */}
            <RealtimeOrderList initialOrders={initialOrders} />
        </div>
    );
}
