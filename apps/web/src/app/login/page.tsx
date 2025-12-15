'use client';

import { signInWithLine } from '@/features/auth/line-liff-handler';
import { useState } from 'react';
import { toast } from 'sonner';

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleLineLogin = async () => {
        setIsLoading(true);
        try {
            await signInWithLine();
            // Redirect happens automatically by OAuth
        } catch (error) {
            toast.error('Failed to log in with Line');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Tanjai</h1>
                <p className="text-gray-500 mb-8">Sign in to manage your shop</p>

                <button
                    onClick={handleLineLogin}
                    disabled={isLoading}
                    className="w-full bg-[#00C300] hover:bg-[#00B300] text-white font-bold py-3 px-4 rounded transition-colors flex items-center justify-center gap-2"
                >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path d="M22.03 10.925c0-4.9-4.9-8.925-10.98-8.925C5.02 2 0 6.025 0 10.925c0 4.375 3.86 8.08 9.07 8.785.35.08.825.245.945.56.105.285.07.725.035 1.01l-.14 0.85c-.05.3-.23 1.17 1.025.64 5.37-3.14 7.37-5.325 10.05-9.1.53-.78.98-1.745.98-2.745z" />
                    </svg>
                    {isLoading ? 'Connecting...' : 'Log in with LINE'}
                </button>

                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 pt-4 border-t">
                        <span className="block text-xs text-gray-400 mb-2">Development Actions</span>
                        <button
                            onClick={async () => {
                                // Mock Login: Redirect to Onboarding with a query param that mocks the user
                                // In a real simulation, we might need a backdoor auth endpoint.
                                // For Playwright, we can just intercept the request or use a test-mode route.
                                // Simpler: Redirect to /onboarding?mock_user_id=owner-123
                                // And update Onboarding to inspect this. 
                                // BUT Onboarding checks supabase.auth.getUser().
                                // So we should probably provision a real test user via Supabase or just skip to dashboard if we assume simulation handles state.

                                // Better: "Quick Start as Zaap E-San"
                                // This helps the manual test too.
                                toast.info('Simulating Login...');
                                // We rely on the Automation to handle the filling of Onboarding.
                                // This button effectively just brings us to Onboarding "as if" authenticated.
                                // But we need auth.

                                // Actually, sticking to the Plan logic:
                                // We will implement a specific "DevAuth" action if Supabase allows anon sign in or similar.
                                // Since we don't have Supabase Auth fully mocked, let's use a "Magic Link" or just assume the script handles Supabase side.

                                // Wait, user asked for "Visible browser test". Playwright can verify the Onboarding UI.
                                // So we need to Get PAST the login screen.
                                // IF we can't use real Line Login, we need a "Test Login" that creates a Supabase Session.
                                // Since we don't have the backend for this set up in this session, 
                                // Let's redirect to '/onboarding' directly and allow Onboarding to work WITHOUT user if DEV_MODE.

                                // Hack for MVP E2E:
                                document.cookie = "supabase-auth-token=mock-token; path=/";
                                window.location.href = '/onboarding?mock_auth=true';
                            }}
                            className="w-full bg-gray-200 text-gray-700 py-2 rounded text-sm font-bold"
                        >
                            [DEV] Simulate Owner Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
