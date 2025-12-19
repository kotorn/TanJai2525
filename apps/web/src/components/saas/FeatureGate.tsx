'use client';

import { useFeatureFlag } from '@/features/flags/FeatureFlagProvider';
import { Lock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@tanjai/ui';

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode; // Optional custom fallback
  showOverlay?: boolean; // If true, blurs children instead of hiding
}

export function FeatureGate({ feature, children, fallback, showOverlay = false }: FeatureGateProps) {
  const { enabled, isLoading } = useFeatureFlag(feature);

  if (isLoading) return null; // Or skeleton

  if (enabled) {
    return <>{children}</>;
  }

  // Access Denied State
  if (fallback) return <>{fallback}</>;

  return (
    <div className="relative w-full h-full min-h-[200px] flex items-center justify-center bg-gray-900/5 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center">
      <div className="max-w-md space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20">
          <Lock className="text-white w-8 h-8" />
        </div>
        <div>
          <h3 className="text-xl font-bold font-display text-gray-900 dark:text-white">
            Feature Locked
          </h3>
          <p className="text-gray-500 mt-2">
             Upgrade to <span className="text-amber-500 font-bold">Pro Plan</span> to unlock {feature.replace('module:', '').toUpperCase()}.
          </p>
        </div>
        <Link href="/pricing">
            <Button className="bg-amber-500 hover:bg-amber-600 text-white px-8 rounded-full">
                Upgrade Now
            </Button>
        </Link>
      </div>
    </div>
  );
}
