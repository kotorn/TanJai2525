'use client';

import { signInWithLine, signInWithGoogle, signInWithApple } from '@/features/auth/auth-handlers';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from "@tanjai/ui";
import { Separator } from "@radix-ui/react-separator";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (provider: 'line' | 'google' | 'apple') => {
        setIsLoading(true);
        try {
            switch (provider) {
                case 'line': await signInWithLine(); break;
                case 'google': await signInWithGoogle(); break;
                case 'apple': await signInWithApple(); break;
            }
        } catch (error) {
            toast.error(`Failed to log in with ${provider}`);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center border border-gray-100 backdrop-blur-sm">
                
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Tanjai POS</h1>
                    <p className="text-gray-500 font-medium">Sign in to manage your shop</p>
                </div>

                <div className="space-y-3">
                    {/* Line Login (Primary) */}
                    <Button
                        onClick={() => handleLogin('line')}
                        disabled={isLoading}
                        className="w-full bg-[#06C755] hover:bg-[#05b34c] text-white h-12 text-base font-bold shadow-lg shadow-green-500/20 transition-all active:scale-95"
                    >
                        {/* LINE Icon */}
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-3">
                            <path d="M22.03 10.925c0-4.9-4.9-8.925-10.98-8.925C5.02 2 0 6.025 0 10.925c0 4.375 3.86 8.08 9.07 8.785.35.08.825.245.945.56.105.285.07.725.035 1.01l-.14 0.85c-.05.3-.23 1.17 1.025.64 5.37-3.14 7.37-5.325 10.05-9.1.53-.78.98-1.745.98-2.745z" />
                        </svg>
                        Log in with LINE
                    </Button>

                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-500 font-semibold tracking-wider">Or continue with</span>
                        </div>
                    </div>

                    {/* Google Login */}
                    <Button
                        variant="outline"
                        onClick={() => handleLogin('google')}
                        disabled={isLoading}
                        className="w-full h-11 text-gray-700 font-semibold border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-95"
                    >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google
                    </Button>

                    {/* Apple Login */}
                    <Button
                        variant="secondary"
                        onClick={() => handleLogin('apple')}
                        disabled={isLoading}
                        className="w-full bg-black text-white hover:bg-gray-800 h-11 font-semibold transition-all active:scale-95"
                    >
                         <svg className="w-5 h-5 mr-2 pb-0.5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.21-.93 3.23-.71 1.57.12 2.66.84 3.16 1.59-3.23 1.96-2.58 6.55 1.05 7.9-.53 1.48-1.29 3.16-2.52 3.45M12.03 5.32c-.09 2.03-1.61 3.41-3.23 3.41-.5.03-1.89-1.28-1.57-3.41.97-1.92 2.72-2.91 4.33-2.91.13 2.05-.12 2.14.47 2.91z" />
                        </svg>
                        Apple ID
                    </Button>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 pt-4 border-t border-gray-100">
                        <span className="block text-xs uppercase font-bold text-gray-400 mb-2">Dev Tools</span>
                        <Button
                            variant="ghost"
                            onClick={async () => {
                                document.cookie = "supabase-auth-token=mock-token; path=/";
                                window.location.href = '/onboarding?mock_auth=true';
                            }}
                            className="w-full text-xs text-red-400 hover:text-red-500 hover:bg-red-50"
                        >
                            [DEV] Bypass Auth
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
