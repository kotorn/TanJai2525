import { getSession } from "@/features/order/actions";
import MenuBrowser from "@/features/order/components/MenuBrowser";
import RestaurantHeader from "@/features/order/components/RestaurantHeader";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Suspense } from "react";

export default async function OrderPage({
    searchParams,
}: {
    searchParams: Promise<{ tableId?: string }>;
}) {
    // Resolve searchParams before using
    // In Next.js 15+, searchParams is a promise in some configs, but 14 it's object.
    // Based on user metadata, it's Next.js 16 (from task.md summary "Next.js 16 App Router"). 
    // In 15/16 searchParams might be async in layouts but page props usually treated as awaitable or direct. 
    // To be safe in newer Next.js:
    const { tableId } = await searchParams;

    if (!tableId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                <h1 className="text-xl font-bold">Table ID Not Found</h1>
                <p className="text-muted-foreground mt-2">Please scan the QR code at your table again.</p>
            </div>
        );
    }

    const session = await getSession(tableId);

    if (session.error || !session.table || !session.restaurant) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                <h1 className="text-xl font-bold">Invalid Session</h1>
                <p className="text-muted-foreground mt-2">{session.error || "The table QR code is invalid or expired."}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Suspense fallback={
                <div className="flex items-center justify-center min-h-screen">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                </div>
            }>
                <RestaurantHeader 
                    restaurant={session.restaurant} 
                    tableName={session.table.name} 
                />
                <MenuBrowser 
                    categories={session.categories} 
                    items={session.items} 
                />
            </Suspense>
        </div>
    );
}
