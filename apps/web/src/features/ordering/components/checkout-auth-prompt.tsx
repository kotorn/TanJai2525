'use client';


import { useEffect, useState } from 'react';
import { signInWithLine } from '@/features/auth/line-liff-handler';

import { createClient } from '@/lib/supabase/client';

export default function CheckoutAuthPrompt({ onGuestContinue }: { onGuestContinue: () => void }) {
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user));
    }, [supabase]);

    if (user) {
        return (
            <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg flex justify-between items-center">
                <span>Ordering as <strong>{user.email}</strong></span>
                <span className="text-xs bg-green-200 px-2 py-1 rounded">Loyalty Active</span>
            </div>
        );
    }

    return (
        <div className="mb-6 border rounded-lg p-4 bg-gray-50">
            <h3 className="font-bold text-sm mb-2 text-gray-700">Collect Points?</h3>
            <div className="flex gap-3">
                <button
                    onClick={() => signInWithLine()}
                    className="flex-1 bg-[#00C300] text-white text-sm py-2 rounded font-bold hover:bg-[#00B300]"
                >
                    Log in with Line
                </button>
                <button
                    onClick={onGuestContinue}
                    className="flex-1 bg-white border border-gray-300 text-gray-700 text-sm py-2 rounded font-bold hover:bg-gray-100"
                >
                    Guest Checkout
                </button>
            </div>
        </div>
    );
}
