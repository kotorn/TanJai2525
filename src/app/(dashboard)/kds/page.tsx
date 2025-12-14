import RealtimeOrderList from "@/features/order/components/RealtimeOrderList";

export default function KDSPage() {
    // In a real implementation, we would fetch initial orders from the server here.
    const initialOrders: any[] = [];

    return (
        <div className="flex h-full flex-col gap-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Kitchen Display System</h2>
            </div>
            <RealtimeOrderList initialOrders={initialOrders} />
        </div>
    );
}
