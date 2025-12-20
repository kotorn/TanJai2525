'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCartStore } from '@/stores/useCartStore';

/**
 * UTMTracker Component
 * Automatically captures utm_source and utm_medium from URL search parameters
 * and stores them in the CartStore for order attribution.
 */
export function UTMTracker() {
    const searchParams = useSearchParams();
    const setUTM = useCartStore((state) => state.setUTM);

    useEffect(() => {
        const utmSource = searchParams.get('utm_source');
        const utmMedium = searchParams.get('utm_medium');

        if (utmSource || utmMedium) {
            console.log(`[UTMTracker] Capturing: source=${utmSource}, medium=${utmMedium}`);
            setUTM(utmSource, utmMedium);

            // Also store in sessionStorage as a backup/for cross-page persistence if needed
            if (utmSource) sessionStorage.setItem('tanjai_utm_source', utmSource);
            if (utmMedium) sessionStorage.setItem('tanjai_utm_medium', utmMedium);
        }
    }, [searchParams, setUTM]);

    return null; // This component doesn't render anything
}
