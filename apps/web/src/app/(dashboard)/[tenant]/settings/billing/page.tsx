'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { getSubscriptionStatus } from '@/features/subscription/actions';
import { BillingClient } from './client';

export default async function BillingPage({ params }: { params: { tenant: string } }) {
    const { plan, status, isValid } = await getSubscriptionStatus(params.tenant);

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Subscription & Billing / การชำระเงิน</h1>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Current Plan Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100">
                    <h2 className="text-xl font-semibold mb-2 text-gray-700">Current Plan</h2>
                    <div className="text-4xl font-bold text-orange-600 mb-4 capitalize">
                        {plan}
                    </div>
                    <div className="text-sm text-gray-500 mb-4">
                        Status: <span className={`font-medium ${isValid ? 'text-green-600' : 'text-red-500'}`}>{status}</span>
                    </div>
                    <ul className="space-y-2 text-gray-600 mb-6">
                        <li className="flex items-center">
                            <span className="mr-2">✅</span> POS System
                        </li>
                        <li className={`flex items-center ${plan === 'pro' ? '' : 'text-gray-400'}`}>
                            <span className="mr-2">{plan === 'pro' ? '✅' : '❌'}</span> Kitchen Display System (KDS)
                        </li>
                        <li className={`flex items-center ${plan === 'pro' ? '' : 'text-gray-400'}`}>
                            <span className="mr-2">{plan === 'pro' ? '✅' : '❌'}</span> Advanced Analytics
                        </li>
                    </ul>
                </div>

                {/* Upgrade Card */}
                <BillingClient tenantId={params.tenant} currentPlan={plan} />
            </div>
        </div>
    );
}
