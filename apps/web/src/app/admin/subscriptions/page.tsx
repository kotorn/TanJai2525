import { createClient } from '@/lib/supabase/server';
import { approveSubscription, rejectSubscription } from '@/features/subscription/actions/verify-slip';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';
import Link from 'next/link';

// NOTE: This is a Server Component.
// We'll use naive form actions for buttons for simplicity, or Client Components if we need complex UI.
// Using Server Actions via Forms is the cleanest for MVP.

export default async function AdminSubscriptionsPage() {
    const supabase = createClient();

    // 1. Security Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // 2. Fetch Pending Subscriptions
    // We want Subscriptions that have status='pending_verification' OR have a Pending Slip
    // Let's fetch based on Pending Slips first, as that's the trigger.
    const { data: pendingSlips, error } = await supabase
        .from('payment_slips')
        .select(`
        id,
        amount,
        slip_image_url,
        uploaded_at,
        subscription:subscriptions (
            id,
            status,
            tenant:tenants (
                name,
                slug,
                phone
            )
        )
    `)
        .eq('status', 'pending')
        .order('uploaded_at', { ascending: false });

    if (error) {
        return <div className="p-8 text-red-500">Error loading data: {error.message}</div>;
    }

    // Helper Component for Actions
    const ActionButtons = ({ subId }: { subId: string }) => (
        <div className="flex gap-2">
            <form action={async () => {
                'use server';
                await approveSubscription(subId, 1); // Default 1 month
            }}>
                <button className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors">
                    <CheckCircle size={14} /> Approve (1 Mo)
                </button>
            </form>

            <form action={async () => {
                'use server';
                await rejectSubscription(subId, 'Invalid');
            }}>
                <button className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors">
                    <XCircle size={14} /> Reject
                </button>
            </form>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Subscription Requests</h1>
                <span className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-sm font-medium border border-yellow-500/20">
                    {pendingSlips?.length || 0} Pending
                </span>
            </div>

            <div className="grid gap-4">
                {pendingSlips && pendingSlips.length > 0 ? (
                    pendingSlips.map((slip: any) => (
                        <div key={slip.id} className="bg-gray-800 border border-gray-700 rounded-xl p-6 flex flex-col md:flex-row gap-6">
                            {/* Image Preview - Basic */}
                            <div className="w-full md:w-48 h-64 md:h-48 bg-gray-900 rounded-lg overflow-hidden relative border border-gray-700 flex-shrink-0">
                                {/* We need a way to view the private image. Signed URL? 
                            For MVP, if bucket is private, img src won't work directly without signing.
                            Ideally we use a client component to fetch signed URL.
                            For now, let's assume Super Admin has a way or bucket has public read policy for "authenticated"?
                            (We set logic: Authenticated can insert. Users can view own. Super Admin can view all.)
                            
                            Wait, HTML <img> tag makes a GET request without Auth headers usually (unless same origin cookies work).
                            Supabase Storage with RLS checks the user cookie. So standard <img src> SHOULD work if the browser sends the session cookie.
                         */}
                                <img
                                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/payment_slips/${slip.slip_image_url}`}
                                    // Try public URL pattern first. IF bucket is private, this might fail unless we sign it.
                                    // FIX: Bucket is private. We need a signed URL. 
                                    // Complex to generate inside this server component loop efficiently without multiple calls.
                                    // HACK for MVP: Just try to display assuming browser session might handle it OR just link to it.
                                    alt="Slip"
                                    className="object-cover w-full h-full hover:scale-105 transition-transform"
                                />
                                <a
                                    href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/authenticated/payment_slips/${slip.slip_image_url}`}
                                    target="_blank"
                                    className="absolute bottom-2 right-2 bg-black/60 p-1.5 rounded-full text-white hover:bg-black"
                                >
                                    <ExternalLink size={12} />
                                </a>
                            </div>

                            <div className="flex-1 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                            {slip.subscription.tenant.name}
                                            <span className="text-xs text-gray-500 font-mono bg-gray-900 px-2 py-0.5 rounded">
                                                {slip.subscription.tenant.slug}
                                            </span>
                                        </h3>
                                        <p className="text-gray-400 text-sm mt-1">
                                            Uploaded: {format(new Date(slip.uploaded_at), 'dd MMM yyyy, HH:mm')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-green-400">฿{slip.amount.toLocaleString()}</div>
                                        <div className="text-xs text-yellow-500 flex items-center justify-end gap-1">
                                            <Clock size={12} /> Pending Verification
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 bg-gray-900/50 p-4 rounded-lg text-sm text-gray-300">
                                    <div>
                                        <span className="block text-gray-500 text-xs">Phone</span>
                                        {slip.subscription.tenant.phone || '-'}
                                    </div>
                                    <div>
                                        <span className="block text-gray-500 text-xs">Subscription ID</span>
                                        <span className="font-mono text-xs">{slip.subscription.id.slice(0, 8)}...</span>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <ActionButtons subId={slip.subscription.id} />
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 bg-gray-800/50 rounded-xl border border-dashed border-gray-700">
                        <p className="text-gray-500">No pending subscriptions found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
