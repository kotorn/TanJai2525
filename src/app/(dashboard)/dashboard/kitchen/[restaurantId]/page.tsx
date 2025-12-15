import KitchenBoard from "@/features/kitchen/components/KitchenBoard";
import { fetchKitchenOrders } from "@/features/kitchen/actions";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default async function KitchenPage({ 
    params 
}: { 
    params: Promise<{ restaurantId: string }> 
}) {
    const { restaurantId } = await params;
    const initialOrders = await fetchKitchenOrders(restaurantId);

    return (
        <div className="h-full flex flex-col space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Kitchen Display System</h2>
            </div>
            <div className="flex-1 h-full overflow-hidden">
                <Suspense fallback={
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                }>
                    <KitchenBoard 
                        restaurantId={restaurantId} 
                        initialOrders={initialOrders} 
                    />
                </Suspense>
            </div>
        </div>
    );
}
