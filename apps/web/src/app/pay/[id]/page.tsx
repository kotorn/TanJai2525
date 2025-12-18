"use client";
import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function PayPage({ params }: { params: { id: string } }) {
    // Mock status logic based on ID prefix for testing
    // In production, this would fetch from Supabase 'dynamic_qrs' table
    const isPaidMock = params.id.startsWith('paid');
    const isExpiredMock = params.id.startsWith('expired');
    
    // Status Determination
    const uiStatus = isPaidMock ? 'paid' : isExpiredMock ? 'expired' : 'active';

    if (uiStatus === 'paid') {
        return (
            <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-6 text-center font-display">
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500 border border-green-500/30 shadow-[0_0_30px_-5px_rgba(34,197,94,0.4)]">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Already Paid</h1>
                <p className="text-gray-400 mb-8 text-lg font-light">This transaction has been completed.</p>
                <Link href="/menu">
                    <button className="border border-white/10 text-white hover:bg-white/5 h-12 px-8 rounded-xl font-medium transition-colors">
                        Back to Menu
                    </button>
                </Link>
            </div>
        );
    }
    
    if (uiStatus === 'expired') {
         return (
            <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-6 text-center font-display">
                <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500 border border-red-500/30 shadow-[0_0_30px_-5px_rgba(239,68,68,0.4)]">
                    <XCircle className="w-12 h-12 text-red-500" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">QR Expired</h1>
                <p className="text-gray-400 mb-8 text-lg font-light">This payment code is no longer valid.</p>
                <Link href="/menu">
                    <button className="border border-white/10 text-white hover:bg-white/5 h-12 px-8 rounded-xl font-medium transition-colors">
                        Back to Menu
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-6 font-display">
             <div className="glass-panel p-8 rounded-3xl w-full max-w-sm text-center border-white/10 shadow-glass">
                <h1 className="text-2xl font-bold text-white mb-2">Payment Required</h1>
                <p className="text-gray-400 mb-6 text-sm">Transaction ID: {params.id}</p>
                
                <div className="py-6 border-y border-white/5 mb-6">
                    <p className="text-sm text-gray-400 mb-1">Total Amount</p>
                    <p className="text-4xl font-bold text-primary">฿280.00</p>
                </div>

                <Link href="/menu">
                    <button className="w-full h-14 text-lg bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-glow transition-all active:scale-95">
                        Proceed to Pay
                    </button>
                </Link>
             </div>
        </div>
    );
}
