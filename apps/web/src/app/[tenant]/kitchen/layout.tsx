import { validateSubscription } from '@/lib/tenant-auth';

export default async function KitchenLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { tenant: string };
}) {
    await validateSubscription(params.tenant);
    return <>{children}</>;
}
