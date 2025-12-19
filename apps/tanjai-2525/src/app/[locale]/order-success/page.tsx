'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@tanjai/ui';
import { CheckCircle2, Package, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function OrderSuccess() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in duration-500">
        {/* Celebration Icon */}
        <div className="relative flex justify-center">
          <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full" />
          <div className="relative bg-zinc-900 border border-amber-500/50 p-6 rounded-full shadow-2xl">
            <CheckCircle2 className="w-16 h-16 text-amber-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white">Order Received!</h1>
          <p className="text-zinc-400">
            Your order has been sent to the packing station. Please wait for your slip.
          </p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 space-y-6">
          <div className="flex items-center gap-4 text-left">
            <div className="bg-amber-500/10 p-3 rounded-2xl">
              <Package className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Order Status</p>
              <p className="text-white font-bold text-lg">Preparing Items</p>
            </div>
          </div>

          <div className="space-y-3">
             <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Est. Packing Time</span>
                <span className="text-white font-medium">~5 mins</span>
             </div>
             <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-1/3 animate-pulse" />
             </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link href={`/${locale}`} className="w-full">
            <Button className="w-full bg-white text-black font-black h-14 rounded-2xl hover:bg-zinc-200 transition-colors">
              Continue Shopping
            </Button>
          </Link>
          <Button variant="ghost" className="text-zinc-500 hover:text-white flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            View Order Receipt
          </Button>
        </div>
      </div>
    </div>
  );
}
