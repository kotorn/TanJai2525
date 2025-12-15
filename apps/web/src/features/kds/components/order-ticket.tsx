'use client';

import { CheckCircle, Clock, ChefHat } from 'lucide-react';
import { updateOrderStatus } from '../actions';
import { useState } from 'react';
import { toast } from 'sonner';

type OrderProps = {
    order: any;
    tenantId: string;
};

function timeAgo(date: Date) {
    const diff = (new Date().getTime() - new Date(date).getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
}

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
        try {
            const res = await updateOrderStatus(tenantId, order.id, next);
            if (!res.success) {
                 toast.error('Failed to update status');
            }
        } catch (e) {
            toast.error('Failed to update');
        } finally {
            setIsUpdating(false);
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
        <div className={`border-l-4 rounded-xl shadow-sm p-4 ${getStatusColor(order.status)} bg-white w-full sm:w-auto sm:min-w-[300px]`}>
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-bold text-xl leading-tight">Table {order.table_number}</h3>
                    <span className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Clock className="w-4 h-4" />
                        {timeAgo(order.created_at)}
                    </span>
                </div>
                <span className="px-3 py-1.5 rounded-lg text-xs uppercase font-bold tracking-wider bg-white/50 border min-h-[2rem] flex items-center">
                    {order.status}
                </span>
            </div>

            <div className="space-y-3 mb-6">
                {order.order_items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-start text-base">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                            <span className="font-bold w-8 h-8 flex items-center justify-center bg-gray-200 rounded-lg shrink-0">{item.quantity}</span>
                            <span className="line-clamp-2 leading-relaxed pt-0.5 break-words">
                                {item.menu_items?.name || 'Unknown Item'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {nextStatusMap[order.status] && (
                <button
                    onClick={handleAdvance}
                    disabled={isUpdating}
                    className="w-full h-11 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2 active:scale-95 transition-transform touch-manipulation"
                >
                    {isUpdating ? '...' : (
                        <>
                            {order.status === 'pending' && <ChefHat className="w-5 h-5" />}
                            {order.status === 'preparing' && <CheckCircle className="w-5 h-5" />}
                            Mark as {nextStatusMap[order.status]}
                        </>
                    )}
                </button>
            )}
        </div>
    );
}
