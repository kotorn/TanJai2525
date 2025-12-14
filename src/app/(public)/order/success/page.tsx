import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function OrderSuccessPage({
    searchParams,
}: {
    searchParams: Promise<{ tableId?: string }>;
}) {
    // Resolve searchParams (Next.js 15+ safety)
    const { tableId } = await searchParams;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-in zoom-in spin-in-12">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Received!</h1>
            <p className="text-gray-500 mb-8">
                Your order has been sent to the kitchen and will be ready shortly.
            </p>

            <div className="w-full max-w-xs space-y-3">
                <Link href={`/order?tableId=${tableId}`}>
                    <Button className="w-full" size="lg">Order More Items</Button>
                </Link>
                {/* Future: Link to 'My Order' status page */}
            </div>
        </div>
    );
}
