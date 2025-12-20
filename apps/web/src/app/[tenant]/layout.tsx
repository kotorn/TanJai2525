import { validateSubscription } from '@/lib/tenant-auth';

export default async function TenantLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { tenant: string };
}) {
    // Enforce Paywall / Subscription Check
    // Public Menu should be accessible
    // validateSubscription moved to sub-layouts (admin, kds, kitchen)
    return (
        <>
            {children}
        </>
    );
}
