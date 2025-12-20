'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export default function BillingPage({ params }: { params: { tenant: string } }) {
    // Determine plan from props or context (mock for now)
    const currentPlan = 'free'; // 'free', 'pro'
    const [isUploading, setIsUploading] = useState(false);

    const handleUploadSlip = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);
        // Simulator for upload
        setTimeout(() => {
            setIsUploading(false);
            toast.success('Slip uploaded! Waiting for admin approval.');
        }, 1500);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Subscription & Billing / การชำระเงิน</h1>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Current Plan Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100">
                    <h2 className="text-xl font-semibold mb-2 text-gray-700">Current Plan</h2>
                    <div className="text-4xl font-bold text-orange-600 mb-4 capitalize">
                        {currentPlan}
                    </div>
                    <ul className="space-y-2 text-gray-600 mb-6">
                        <li className="flex items-center">
                            <span className="mr-2">✅</span> POS System
                        </li>
                        <li className="flex items-center text-gray-400">
                            <span className="mr-2">❌</span> Kitchen Display System (KDS)
                        </li>
                        <li className="flex items-center text-gray-400">
                            <span className="mr-2">❌</span> Advanced Analytics
                        </li>
                    </ul>
                </div>

                {/* Promotion / Upgrade Card */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-xl font-semibold mb-2 text-orange-400">Upgrade to PRO</h2>
                        <div className="text-3xl font-bold mb-4">฿499 <span className="text-sm font-normal text-gray-400">/ month</span></div>
                        <ul className="space-y-2 text-gray-300 mb-6 text-sm">
                            <li className="flex items-center"><span className="mr-2 text-green-400">✓</span> Unlock KDS (Ollama AI)</li>
                            <li className="flex items-center"><span className="mr-2 text-green-400">✓</span> Real-time Sales Analytics</li>
                            <li className="flex items-center"><span className="mr-2 text-green-400">✓</span> Unlimited Staff Accounts</li>
                        </ul>

                        <form onSubmit={handleUploadSlip} className="mt-4">
                            <label className="block text-xs text-gray-400 mb-1">Transfer to: SCB 123-456-7890 (Tanjai POS)</label>
                            <button
                                type="submit"
                                disabled={isUploading}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-bold transition-all disabled:opacity-50"
                            >
                                {isUploading ? 'Uploading...' : 'Confirm Payment (Attach Slip)'}
                            </button>
                        </form>
                    </div>

                    {/* Background decoration */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-orange-500 opacity-10 rounded-full blur-3xl"></div>
                </div>
            </div>
        </div>
    );
}
