'use client';

import { signInWithLine, signInWithGoogle, signInWithApple, signInWithFacebook, signInWithEmail, signUpWithEmail } from '@/features/auth/auth-handlers';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from "@tanjai/ui";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (mode === 'signin') {
                await signInWithEmail(email, password);
                console.log('[Auth] Email login successful');
                // Force redirect to onboarding or dashboard
                window.location.href = '/onboarding';
            } else {
                await signUpWithEmail(email, password);
                toast.success('Registration successful! Please check your email to confirm.');
                // For safety, redirect too if auto-login
                window.location.href = '/onboarding';
            }
        } catch (error: any) {
            console.error(`[Auth] ${mode} failed:`, error);
            toast.error(error?.message || `Failed to ${mode === 'signin' ? 'sign in' : 'sign up'}`);
            setIsLoading(false);
        } finally {
            // Keep loading true on success for signin (redirecting), but false for signup
            if (mode === 'signup') setIsLoading(false);
        }
    };

    const handleLogin = async (provider: 'line' | 'google' | 'apple' | 'facebook') => {
        setIsLoading(true);
        try {
            switch (provider) {
                case 'line': await signInWithLine(); break;
                case 'google': await signInWithGoogle(); break;
                case 'apple': await signInWithApple(); break;
                case 'facebook': await signInWithFacebook(); break;
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
                <div className="mb-6">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Tanjai POS</h1>
                    <p className="text-gray-500 font-medium">
                        {mode === 'signin' ? 'Sign in to manage your shop' : 'Create an account to get started'}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
                    <button
                        onClick={() => setMode('signin')}
                        className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${mode === 'signin' ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        disabled={isLoading}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => setMode('signup')}
                        className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${mode === 'signup' ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        disabled={isLoading}
                    >
                        Sign Up
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Email Form */}
                    <form className="space-y-3" onSubmit={handleEmailAuth}>
                        <div className="space-y-1 text-left">
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                placeholder="name@example.com"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
                                disabled={isLoading}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1 text-left">
                            <label className="text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
                                disabled={isLoading}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-black text-white hover:bg-gray-800 h-11 font-semibold"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processing...' : (mode === 'signin' ? 'Sign in' : 'Create Account')}
                        </Button>
                    </form>

                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-500 font-semibold tracking-wider">Or continue with</span>
                        </div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Facebook */}
                        <Button
                            onClick={() => handleLogin('facebook')}
                            disabled={isLoading}
                            className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white h-11 font-semibold shadow-sm"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                        </Button>

                        {/* Google */}
                        <Button
                            variant="outline"
                            onClick={() => handleLogin('google')}
                            disabled={isLoading}
                            className="w-full h-11 border-gray-200 hover:bg-gray-50"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        </Button>
                    </div>
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
