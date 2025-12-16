'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type FeatureContextType = {
    features: Set<string>;
    tier: 'free' | 'pro' | 'enterprise';
    isLoading: boolean;
};

const FeatureContext = createContext<FeatureContextType>({
    features: new Set(),
    tier: 'free',
    isLoading: true,
});

export const useFeatureFlag = (key: string) => {
    const { features, tier, isLoading } = useContext(FeatureContext);
    // If loading, default to false (safe fail)
    // In dev mode, we might want to override via localStorage
    return {
        enabled: features.has(key),
        tier,
        isLoading
    };
};

export function FeatureFlagProvider({ children }: { children: React.ReactNode }) {
    const [features, setFeatures] = useState<Set<string>>(new Set());
    const [tier, setTier] = useState<'free' | 'pro' | 'enterprise'>('free');
    const [isLoading, setIsLoading] = useState(true);
    
    // Supabase Client
    const supabase = createClient();

    useEffect(() => {
        async function loadFlags() {
            try {
                // 1. Get User
                const { data: { user } } = await supabase.auth.getUser();
                
                if (!user) {
                    setTier('free');
                    // Load default free features if needed, or just leave empty
                    // For improved DX, we fetch 'free' tier features locally or via public API
                    setIsLoading(false);
                    return;
                }

                // 2. Fetch Subscription
                const { data: sub } = await supabase
                    .from('subscriptions')
                    .select('tier')
                    .eq('user_id', user.id)
                    .single();
                
                const currentTier = sub?.tier || 'free';
                setTier(currentTier);

                // 3. Fetch Features for this Tier
                const { data: planFeatures } = await supabase
                    .from('plan_features')
                    .select('feature_key')
                    .eq('plan_tier', currentTier);

                if (planFeatures) {
                    setFeatures(new Set(planFeatures.map(f => f.feature_key)));
                }

            } catch (err) {
                console.error('Failed to load feature flags:', err);
            } finally {
                setIsLoading(false);
            }
        }

        loadFlags();
    }, []);

    return (
        <FeatureContext.Provider value={{ features, tier, isLoading }}>
            {children}
        </FeatureContext.Provider>
    );
}
