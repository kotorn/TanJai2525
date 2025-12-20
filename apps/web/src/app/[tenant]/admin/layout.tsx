import { validateSubscription } from '@/lib/tenant-auth';

export default async function AdminLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { tenant: string };
}) {
    await validateSubscription(params.tenant);
    return <>{children}</>;
}
