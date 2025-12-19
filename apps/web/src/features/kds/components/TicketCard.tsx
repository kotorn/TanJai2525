'use client';

import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import { Timer, ChefHat, CheckCircle } from 'lucide-react';
import { Button } from '@tanjai/ui';

export function TicketCard({ order,onAction, actionLabel, variant }: any) {
  const timeElapsed = formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: th });
  
  return (
    <div className={`p-4 rounded-xl border ${
        variant === 'pending' 
        ? 'bg-[#1e1e1e] border-l-4 border-l-red-500 border-white/5' 
        : 'bg-[#1e1e1e] border-l-4 border-l-yellow-500 border-white/5'
    } shadow-lg relative`}>
        <div className="flex justify-between items-start mb-3">
            <div>
                <span className="text-2xl font-black text-white">T{order.table_no}</span>
                <span className="text-xs text-gray-400 block">#{order.id.slice(0,6)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-lg">
                <Timer size={12} />
                {timeElapsed}
            </div>
        </div>

        <div className="space-y-2 mb-4">
            {order.order_items?.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-start text-sm border-b border-dashed border-white/10 pb-2 last:border-0 last:pb-0">
                    <div className="flex gap-2">
                        <span className="font-bold text-white w-6 text-center bg-white/10 rounded">{item.quantity}</span>
                        <div>
                            <span className="text-gray-200">{item.menu_items?.name || item.name}</span>
                            {item.modifiers && Object.keys(item.modifiers).length > 0 && (
                                <div className="text-xs text-gray-500 mt-1">
                                    {Object.entries(item.modifiers).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                </div>
                            )}
                            {item.notes && <div className="text-xs text-yellow-500/80 italic mt-1">Note: {item.notes}</div>}
                        </div>
                    </div>
                </div>
            ))}
        </div>
        
        {order.special_instructions && (
            <div className="mb-4 bg-red-500/10 text-red-400 text-xs p-2 rounded border border-red-500/20">
                ⚠️ {order.special_instructions}
            </div>
        )}

        <Button 
            className={`w-full py-6 font-bold text-lg shadow-glow ${
                variant === 'pending' 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
            onClick={onAction}
        >
            {variant === 'pending' ? <ChefHat className="mr-2" /> : <CheckCircle className="mr-2" />}
            {actionLabel}
        </Button>
    </div>
  );
}
