'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useState, useEffect } from 'react';
import { provisionTenant } from '@/features/auth/actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function OnboardingPage() {
    const [shopName, setShopName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const supabase = createClientComponentClient();

    useEffect(() => {
        const getUser = async () => {
            const params = new URLSearchParams(window.location.search);
            if (params.get('mock_auth') === 'true' && process.env.NODE_ENV === 'development') {
                // Mock User for Simulation
                setUser({ id: 'owner-simulation-id', email: 'owner@gmail.com' });
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) router.push('/login');
            setUser(user);
        };
        getUser();
    }, [supabase, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!shopName || !user) return;

        setIsSubmitting(true);
        try {
            const result = await provisionTenant(shopName, user.id, user.email || '');

            if (result.success) {
                toast.success('Shop created!');
                // Refresh to update middleware context if needed, or straight redirect
                window.location.href = `/${result.slug}`;
            } else {
                toast.error('Error: ' + result.error);
            }
        } catch (err) {
            toast.error('Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) return <div className="p-10 text-center">Loading user...</div>;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4">Setup your Shop</h1>
                <p className="text-gray-500 mb-6">Enter your restaurant name to get started.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                        <input
                            type="text"
                            value={shopName}
                            onChange={(e) => setShopName(e.target.value)}
                            className="w-full border rounded-md p-2"
                            placeholder="e.g. Noodle Master"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-orange-600 text-white py-2 rounded font-bold hover:bg-orange-700 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Creating Shop...' : 'Start using Tanjai POS'}
                    </button>
                </form>
            </div>
        </div>
    );
}
