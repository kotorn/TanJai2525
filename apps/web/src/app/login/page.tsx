'use client';

import { signInWithLine } from '@/features/auth/line-liff-handler';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

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

                <Button
                    onClick={handleLineLogin}
                    disabled={isLoading}
                    className="w-full bg-[#00C300] hover:bg-[#00B300] h-12 text-base font-bold"
                >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2">
                        <path d="M22.03 10.925c0-4.9-4.9-8.925-10.98-8.925C5.02 2 0 6.025 0 10.925c0 4.375 3.86 8.08 9.07 8.785.35.08.825.245.945.56.105.285.07.725.035 1.01l-.14 0.85c-.05.3-.23 1.17 1.025.64 5.37-3.14 7.37-5.325 10.05-9.1.53-.78.98-1.745.98-2.745z" />
                    </svg>
                    {isLoading ? 'Connecting...' : 'Log in with LINE'}
                </Button>

                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 pt-4 border-t">
                        <span className="block text-xs text-gray-400 mb-2">Development Actions</span>
                        <Button
                            variant="secondary"
                            onClick={async () => {
                                // Simulate Login Hack
                                document.cookie = "supabase-auth-token=mock-token; path=/";
                                window.location.href = '/onboarding?mock_auth=true';
                            }}
                            className="w-full h-11 font-bold"
                        >
                            [DEV] Simulate Owner Login
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
