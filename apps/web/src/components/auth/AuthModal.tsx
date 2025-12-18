'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { X, Mail, Lock, User } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signInWithEmail, signUpWithEmail, signInWithLine } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = mode === 'signin'
        ? await signInWithEmail(email, password)
        : await signUpWithEmail(email, password, displayName);

      if (error) throw error;
      
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLineLogin = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithLine();
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-anon-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-anon-cultured">
          <h2 className="text-anon-3 font-bold text-anon-eerie-black">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-anon-8 text-red-600">{error}</p>
            </div>
          )}

          {/* LINE Login */}
          <button
            onClick={handleLineLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#06C755] hover:bg-[#05B34C] text-white font-bold rounded-xl transition-colors mb-4"
          >
            <span className="text-2xl">LINE</span>
            <span>Continue with LINE</span>
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-anon-cultured"></div>
            </div>
            <div className="relative flex justify-center text-anon-8">
              <span className="px-2 bg-white text-anon-sonic-silver">Or continue with email</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-anon-7 text-anon-eerie-black font-medium mb-2">
                  Display Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-anon-sonic-silver" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required={mode === 'signup'}
                    className="w-full pl-10 pr-4 py-3 border border-anon-cultured rounded-xl focus:border-anon-salmon-pink focus:outline-none focus:ring-2 focus:ring-anon-salmon-pink/20"
                    placeholder="Your name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-anon-7 text-anon-eerie-black font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-anon-sonic-silver" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-anon-cultured rounded-xl focus:border-anon-salmon-pink focus:outline-none focus:ring-2 focus:ring-anon-salmon-pink/20"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-anon-7 text-anon-eerie-black font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-anon-sonic-silver" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-anon-cultured rounded-xl focus:border-anon-salmon-pink focus:outline-none focus:ring-2 focus:ring-anon-salmon-pink/20"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-anon-salmon-pink hover:bg-anon-sandy-brown text-white font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="text-anon-7 text-anon-sonic-silver hover:text-anon-salmon-pink transition-colors"
            >
              {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
