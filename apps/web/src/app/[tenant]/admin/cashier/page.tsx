'use client';

import { useState, useEffect } from 'react';
import { getUnpaidOrders, markOrderPaid } from '@/features/payment/actions'; // We'll assume we can call getUnpaidOrders from client or pass via page prop. 
// For simplicity in this demo, let's fetch client side or use a server component wrapper. 
// Since this is a Page defined as default export, let's make it a Server Component if possible, 
// but we need interactivity. So Client Component is easier for the "Pay" button feedback.

// Actually, let's make it a Client Component that accepts initial data or fetches.
// Or better: Server Component Page -> Client List.
// Let's stick to a simple Client Component that fetches on mount (MVP style) or Server Actions.
import { toast } from 'sonner';

export default function CashierPage({ params }: { params: { tenant: string } }) {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        setLoading(true);
        const data = await getUnpaidOrders(params.tenant);
        setOrders(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
    }, [params.tenant]);

    const handlePay = async (orderId: string, tableNum: string) => {
        const res = await markOrderPaid(params.tenant, orderId);
        if (res.success) {
            toast.success(`Table ${tableNum} Paid!`);
            fetchOrders();
        } else {
            toast.error('Payment failed');
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Cashier / Bill Payment</h1>

            {loading ? (
                <p>Loading tables...</p>
            ) : orders.length === 0 ? (
                <p className="text-green-600 font-bold">All tables are clear!</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {orders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-4 bg-white shadow flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg">Table {order.table_number}</h3>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${order.status === 'ready' || order.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="text-gray-500 text-sm mb-4">
                                    ID: {order.id.slice(0, 6)}...
                                </div>
                            </div>

                            <button
                                onClick={() => handlePay(order.id, order.table_number)}
                                className="w-full bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700 mt-2"
                            >
                                Cash Payment (฿{order.total_amount || '-'})
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
