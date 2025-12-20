'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';

type FeatureContextType = {
    features: Record<string, any>; // Changed from Set to Record for values (e.g. limit:items = 50)
    tier: 'free' | 'pro' | 'enterprise';
    isLoading: boolean;
    checkFeature: (key: string) => boolean;
    getLimit: (key: string) => number;
};

const FeatureContext = createContext<FeatureContextType>({
    features: {},
    tier: 'free',
    isLoading: true,
    checkFeature: () => false,
    getLimit: () => 0,
});

export const useFeatureFlag = (key: string) => {
    const { features, tier, isLoading, checkFeature, getLimit } = useContext(FeatureContext);
    return {
        enabled: checkFeature(key),
        limit: getLimit(key),
        tier,
        isLoading
    };
};

export function FeatureFlagProvider({ children }: { children: React.ReactNode }) {
    const [features, setFeatures] = useState<Record<string, any>>({});
    const [tier, setTier] = useState<'free' | 'pro' | 'enterprise'>('free');
    const [isLoading, setIsLoading] = useState(true);

    const supabase = useMemo(() => createClient(), []);

    useEffect(() => {
        async function loadFlags() {
            try {
                // 1. Get User
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    setTier('free');
                    // Default Free features if DB is unreachable or guest
                    setFeatures({ "limit:items": 50, "module:kds": false });
                    setIsLoading(false);
                    return;
                }

                // 2. Fetch Subscription -> Plan
                // Note: user_id logic might vary if multi-tenant. Assuming 1 User = 1 Restaurant for now or User is Owner
                const { data: sub } = await supabase
                    .from('subscriptions')
                    .select(`
                        status,
                        system_plans (
                            id,
                            name,
                            features
                        )
                    `)
                    .eq('user_id', user.id) // Assuming we added user_id to subscriptions or link via restaurant
                    // If subscriptions is linked to restaurant, we need to find restaurant owned by user first.
                    // Let's assume for MVP: subscriptions has owner_id or we query restaurants first.
                    // Given simplified schema: restaurants -> plan_id. subscriptions is for stripe status.
                    // Let's check 'restaurants' table for the plan.
                    .single();

                // Fallback or better query:
                // Find restaurant owned by user
                const { data: restaurant } = await supabase
                    .from('restaurants')
                    .select('plan_id, system_plans(features)')
                    .eq('owner_id', user.id)
                    .single();

                if (restaurant && restaurant.system_plans) {
                    const planFeatures = (restaurant.system_plans.features as Record<string, any>) || {};
                    setFeatures(planFeatures);
                    // Determine Tier Name from ID or just use 'pro' if features say so? 
                    // Let's stick to simple "plan_free" = free.
                    // @ts-ignore
                    const planId = restaurant.plan_id;
                    setTier(planId.includes('pro') ? 'pro' : 'free');
                } else {
                    // Default Free
                    setFeatures({ "limit:items": 50, "module:kds": false });
                }

            } catch (err) {
                console.error('Failed to load feature flags:', err);
                setFeatures({ "limit:items": 50 }); // Safe fallback
            } finally {
                setIsLoading(false);
            }
        }

        loadFlags();
    }, []);

    const checkFeature = (key: string) => {
        const val = features[key];
        if (typeof val === 'boolean') return val;
        // If it's a limit (number), existence means enabled? No, distinct keys.
        // Convention: module:xyz is boolean.
        return !!val;
    };

    const getLimit = (key: string) => {
        const val = features[key];
        if (typeof val === 'number') return val;
        return 0; // unlimited or none? Let's say 0 is none. -1 is unlimited.
    };

    return (
        <FeatureContext.Provider value={{ features, tier, isLoading, checkFeature, getLimit }}>
            {children}
        </FeatureContext.Provider>
    );
}
