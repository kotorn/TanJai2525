'use client';

import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';
import { Database } from '@/lib/database.types';
import { CheckCircle, ChefHat, Clock, Utensils } from 'lucide-react';

type Order = Database['public']['Tables']['orders']['Row'];

interface OrderCardProps {
    order: Order;
    onUpdateStatus: (orderId: string, status: string) => void;
}

export function OrderCard({ order, onUpdateStatus }: OrderCardProps) {
    const [elapsed, setElapsed] = useState('');

    // 1. Live Timer
    useEffect(() => {
        const timer = setInterval(() => {
            setElapsed(formatDistanceToNow(new Date(order.created_at), { addSuffix: false }));
        }, 1000 * 60); // Update every minute
        setElapsed(formatDistanceToNow(new Date(order.created_at), { addSuffix: false })); // Initial

        return () => clearInterval(timer);
    }, [order.created_at]);

    // 2. Parse Items
    // items is Json, need to cast it. Ideally define a type for OrderItem.
    const items: any[] = Array.isArray(order.items) ? order.items : [];

    // 3. Status Colors
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'border-l-4 border-yellow-500 bg-gray-800';
            case 'cooking': return 'border-l-4 border-orange-500 bg-gray-800';
            case 'ready': return 'border-l-4 border-green-500 bg-gray-800';
            default: return 'bg-gray-800';
        }
    };

    return (
        <div className={`rounded-xl shadow-lg overflow-hidden flex flex-col ${getStatusColor(order.status)}`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-700 flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold text-white">
                        {order.table_id ? `Table ${order.table_id}` : `Order #${order.id.slice(0, 4)}`}
                    </h3>
                    <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Clock size={12} /> {elapsed} ago
                    </div>
                </div>
                <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase 
                ${order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : ''}
                ${order.status === 'cooking' ? 'bg-orange-500/20 text-orange-500' : ''}
                ${order.status === 'ready' ? 'bg-green-500/20 text-green-500' : ''}
             `}>
                        {order.status}
                    </span>
                </div>
            </div>

            {/* Items List */}
            <div className="flex-1 p-4 space-y-3">
                {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start text-sm">
                        <div className="text-gray-200">
                            <span className="font-bold text-white mr-2">{item.quantity}x</span>
                            {item.name}
                            {item.options && item.options.length > 0 && (
                                <div className="text-xs text-gray-500 pl-6">
                                    {item.options.map((opt: any) => opt.name).join(', ')}
                                </div>
                            )}
                            {item.notes && (
                                <div className="text-xs text-red-400 pl-6 italic">
                                    "{item.notes}"
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="p-3 bg-gray-900 border-t border-gray-700 grid grid-cols-2 gap-2">
                {order.status === 'pending' && (
                    <button
                        onClick={() => onUpdateStatus(order.id, 'cooking')}
                        className="col-span-2 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                        <ChefHat size={18} /> Start Cooking
                    </button>
                )}

                {order.status === 'cooking' && (
                    <button
                        onClick={() => onUpdateStatus(order.id, 'ready')}
                        className="col-span-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                        <Utensils size={18} /> Ready to Serve
                    </button>
                )}

                {order.status === 'ready' && (
                    <button
                        onClick={() => onUpdateStatus(order.id, 'served')}
                        className="col-span-2 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                        <CheckCircle size={18} /> Served
                    </button>
                )}
            </div>
        </div>
    );
}
