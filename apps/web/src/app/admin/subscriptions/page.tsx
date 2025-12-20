import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import Image from 'next/image';

async function getPendingSlips() {
    const supabase = createClient();

    // Join payment_slips -> subscriptions -> restaurants to get context
    const { data: slips, error } = await supabase
        .from('payment_slips')
        .select(`
            *,
            subscription:subscriptions(
                id,
                plan_id,
                restaurant:restaurants(name, id)
            )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Fetch Pending Slips Error:', error);
        return [];
    }

    return slips;
}

async function approveSlip(slipId: string, subscriptionId: string) {
    'use server';
    const supabase = createClient();

    // 1. Update Slip
    // @ts-ignore
    await supabase.from('payment_slips').update({ status: 'approved' }).eq('id', slipId);

    // 2. Activate Subscription
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(now.getMonth() + 1);

    // @ts-ignore
    await supabase.from('subscriptions').update({
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: nextMonth.toISOString()
    }).eq('id', subscriptionId);

    revalidatePath('/admin/subscriptions');
}

async function rejectSlip(slipId: string) {
    'use server';
    const supabase = createClient();
    // @ts-ignore
    await supabase.from('payment_slips').update({ status: 'rejected' }).eq('id', slipId);
    revalidatePath('/admin/subscriptions');
}

export default async function SubscriptionsPage() {
    const slips = await getPendingSlips();

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-white">Pending Proof of Payments</h1>

            {slips.length === 0 ? (
                <div className="bg-gray-800 rounded-lg p-12 text-center text-gray-400 border border-gray-700">
                    No pending payments. Good job!
                </div>
            ) : (
                <div className="space-y-6">
                    {slips.map((slip: any) => (
                        <div key={slip.id} className="bg-gray-800 border border-gray-700 rounded-xl p-6 flex gap-6">
                            {/* Slip Image */}
                            <div className="w-1/3 relative h-64 bg-black/50 rounded-lg overflow-hidden border border-gray-600">
                                {slip.slip_image_url && (
                                    <Image
                                        src={slip.slip_image_url}
                                        alt="Payment Slip"
                                        fill
                                        className="object-contain"
                                    />
                                )}
                            </div>

                            {/* Details & Actions */}
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">
                                        {slip.subscription.restaurant.name}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                                        <div>
                                            <span className="text-gray-500 block">Plan</span>
                                            <span className="font-mono text-orange-400 uppercase">{slip.subscription.plan_id}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block">Amount</span>
                                            <span className="font-mono text-green-400 text-lg">฿{slip.amount}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block">Date</span>
                                            <span>{new Date(slip.created_at).toLocaleString()}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block">Slip ID</span>
                                            <span className="font-mono text-xs text-gray-600">{slip.id}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-6 pt-6 border-t border-gray-700">
                                    <form action={approveSlip.bind(null, slip.id, slip.subscription.id)}>
                                        <button className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                                            Approve & Activate
                                        </button>
                                    </form>
                                    <form action={rejectSlip.bind(null, slip.id)}>
                                        <button className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                                            Reject
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
