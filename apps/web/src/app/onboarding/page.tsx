'use client';

import { useState, useEffect } from 'react';
import { provisionTenant } from '@/features/auth/actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export default function OnboardingPage() {
    const [shopName, setShopName] = useState('');
    const [cuisine, setCuisine] = useState('');
    const [location, setLocation] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
             const { data: { user }, error } = await supabase.auth.getUser();
             if (error || !user) {
                 toast.error('You must be logged in to create a shop');
                 router.push('/login');
                 return;
             }
             setUser(user);
        };
        getUser();
    }, [router, supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!shopName || !user) return;

        setIsSubmitting(true);
        try {
            // Include extra fields in payload if needed, or just focus on Name for now
            const result = await provisionTenant(shopName, user.id, user.email || '', { cuisine, location });

            if (result.success) {
                toast.success('Shop created!');
                window.location.href = `/${result.slug}/dashboard`;
            } else {
                toast.error('Error: ' + result.error);
            }
        } catch (err) {
            toast.error('Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4">Setup your Restaurant</h1>
                <p className="text-gray-500 mb-6">Tell us a bit about your shop.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
                        <input
                            type="text"
                            value={shopName}
                            onChange={(e) => setShopName(e.target.value)}
                            className="w-full border rounded-md p-2"
                            placeholder="e.g. Noodle Master"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine Type</label>
                         <select 
                            value={cuisine} 
                            onChange={(e) => setCuisine(e.target.value)}
                            className="w-full border rounded-md p-2"
                            required
                        >
                            <option value="">Select Cuisine</option>
                            <option value="Thai">Thai</option>
                            <option value="Japanese">Japanese</option>
                            <option value="Cafe">Cafe</option>
                            <option value="Western">Western</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full border rounded-md p-2"
                            placeholder="e.g. Bangkok"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-orange-600 text-white py-2 rounded font-bold hover:bg-orange-700 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Creating Shop...' : 'Launch Tanjai POS'}
                    </button>
                </form>
            </div>
        </div>
    );
}
