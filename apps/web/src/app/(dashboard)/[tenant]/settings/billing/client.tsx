'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { upgradeSubscription } from '@/features/subscription/actions';

export function BillingClient({ tenantId, currentPlan }: { tenantId: string, currentPlan: string }) {
    const [isUploading, setIsUploading] = useState(false);

    const handleUploadSlip = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);

        try {
            // TODO: Implement real file upload to Storage
            // For now, using a mock URL to test the flow
            const mockSlipUrl = `https://mock-slip.com/${Date.now()}.jpg`;

            const result = await upgradeSubscription(tenantId, 'pro', mockSlipUrl, 499);

            if (result.success) {
                toast.success('Slip uploaded! Waiting for admin approval.');
            } else {
                toast.error('Failed to submit: ' + result.error);
            }
        } catch (err) {
            toast.error('Unexpected error occurred');
        } finally {
            setIsUploading(false);
        }
    };

    if (currentPlan === 'pro') {
        return (
            <div className="bg-gradient-to-br from-green-900 to-green-800 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-xl font-semibold mb-2 text-green-400">You are PRO!</h2>
                    <div className="text-3xl font-bold mb-4">Active</div>
                    <p className="text-gray-300">Enjoy full access to KDS and Analytics.</p>
                </div>
            </div>
        );
    }

    return (
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
                    <label className="block text-xs text-gray-400 mb-1">Step 1: Transfer 499฿ to SCB 123-456-7890 (Tanjai POS)</label>
                    <label className="block text-xs text-gray-400 mb-2">Step 2: Click Confirm (Mock Slip Upload)</label>

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
    );
}
