'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
// In a real app, we would fetch the subscription status from a context or hook
// For now, we'll accept a prop or mock it
// import { useSubscription } from '@/hooks/useSubscription'; 

interface FeatureGateProps {
    children: ReactNode;
    plan: 'free' | 'pro' | 'enterprise';
    fallback?: ReactNode;
}

export default function FeatureGate({ children, plan, fallback }: FeatureGateProps) {
    // Mock subscription for MVP - In reality, replace this with actual check
    // const { subscription } = useSubscription();
    const currentPlan = 'free'; // Default to free for now

    const plans = {
        free: 0,
        pro: 1,
        enterprise: 2
    };

    if (plans[currentPlan] >= plans[plan]) {
        return <>{children}</>;
    }

    return <>{fallback || null}</>;
}
