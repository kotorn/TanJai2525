'use client';

import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, Clock, ChefHat } from 'lucide-react';
import { updateOrderStatus } from '../actions';
import { useState } from 'react';
import { toast } from 'sonner';

type OrderProps = {
    order: any;
    tenantId: string;
};

export default function OrderTicket({ order, tenantId }: OrderProps) {
    const [isUpdating, setIsUpdating] = useState(false);

    // Simple status machine: pending -> preparing -> ready -> completed
    const nextStatusMap: Record<string, string> = {
        'pending': 'preparing',
        'preparing': 'ready',
        'ready': 'completed'
    };

    const handleAdvance = async () => {
        const next = nextStatusMap[order.status];
        if (!next) return;

        setIsUpdating(true);
        const res = await updateOrderStatus(tenantId, order.id, next);
        setIsUpdating(false);

        if (res.error) {
            toast.error('Failed to update: ' + res.error);
        }
    };

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'pending': return 'bg-gray-100 border-gray-300';
            case 'preparing': return 'bg-blue-50 border-blue-400';
            case 'ready': return 'bg-green-50 border-green-500';
            default: return 'bg-white';
        }
    };

    return (
        <div className={`border-l-4 rounded shadow-sm p-4 ${getStatusColor(order.status)} bg-white min-w-[300px]`}>
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="font-bold text-lg">Table {order.table_number}</h3>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                    </span>
                </div>
                <span className="px-2 py-1 rounded text-xs uppercase font-bold tracking-wider bg-white/50 border">
                    {order.status}
                </span>
            </div>

            <div className="space-y-2 mb-4">
                {order.order_items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                            <span className="font-bold w-6 text-center bg-gray-200 rounded">{item.quantity}</span>
                            <span>{item.menu_items?.name || 'Unknown Item'}</span>
                        </div>
                    </div>
                ))}
            </div>

            {nextStatusMap[order.status] && (
                <button
                    onClick={handleAdvance}
                    disabled={isUpdating}
                    className="w-full py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2"
                >
                    {isUpdating ? '...' : (
                        <>
                            {order.status === 'pending' && <ChefHat className="w-4 h-4" />}
                            {order.status === 'preparing' && <CheckCircle className="w-4 h-4" />}
                            Mark as {nextStatusMap[order.status]}
                        </>
                    )}
                </button>
            )}
        </div>
    );
}
