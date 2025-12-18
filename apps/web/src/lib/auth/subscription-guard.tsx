'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Lock } from 'lucide-react';

type FeatureKey = 'inventory' | 'api_access' | 'max_items' | 'tables';

interface SubscriptionGuardProps {
    requiredFeature: FeatureKey;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function SubscriptionGuard({ requiredFeature, children, fallback }: SubscriptionGuardProps) {
    const params = useParams();
    const [allowed, setAllowed] = useState<boolean | null>(null);
    const supabase = createClient();

    useEffect(() => {
        async function checkPermission() {
            // 1. Get Tenant (Slug)
            const tenant = params.tenant as string;
            if (!tenant) return;

            // 2. Fetch Restaurant + Plan
            // Note: In real app, this should be cached or from Context
            // Using implicit knowledge that 'name' or 'slug' maps to tenant, 
            // but here we just query by implicit rule or assuming tenant ID if available.
            // For this stub, we query restaurants where name = tenant (or slug logic)
            // But better: we rely on RLS if authenticated? 
            // For public facing (menu), subscription usually doesn't block *viewing* menu items (unless maintenance mode).
            // This Guard is likely for ADMIN area.
            
            // Let's assume we are checking if the OWNER can access a feature.
            
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                 setAllowed(false);
                 return;
            }

            const { data: restaurant, error } = await supabase
                .from('restaurants')
                .select(`
                    id,
                    plan:system_plans (
                        features
                    )
                `)
                .eq('owner_id', user.id)
                .single();

            if (error || !restaurant || !restaurant.plan) {
                console.error('Plan check failed', error);
                setAllowed(false);
                return;
            }

            const features = (restaurant.plan as any).features || {};
            
            if (features[requiredFeature] === true) {
                setAllowed(true);
            } else {
                setAllowed(false);
            }
        }

        checkPermission();
    }, [params.tenant, requiredFeature, supabase]);

    if (allowed === null) {
        return <div className="p-4 flex items-center gap-2 text-gray-400"><Loader2 className="animate-spin w-4 h-4" /> Verifying Plan...</div>;
    }

    if (!allowed) {
        return fallback || (
            <div className="p-6 border border-yellow-200 bg-yellow-50 rounded-xl flex flex-col items-center text-center gap-2">
                <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
                    <Lock className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900">Upgrade Required</h3>
                <p className="text-sm text-gray-600">This feature ({requiredFeature}) is only available in higher tier plans.</p>
                <button className="mt-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors">
                    View Plans
                </button>
            </div>
        );
    }

    return <>{children}</>;
}
