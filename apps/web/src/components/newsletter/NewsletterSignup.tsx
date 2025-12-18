'use client';

import { Mail, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email,
          tenant_slug: 'demo', // Replace with dynamic tenant
        });

      if (insertError) throw insertError;

      setSuccess(true);
      setEmail('');
    } catch (err: any) {
      if (err.code === '23505') {
        setError('This email is already subscribed!');
      } else {
        setError(err.message || 'Failed to subscribe');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <h3 className="font-bold text-green-900 mb-2">
          Successfully Subscribed!
        </h3>
        <p className="text-anon-8 text-green-700">
          Check your email to confirm your subscription.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-anon-salmon-pink to-anon-sandy-brown rounded-xl p-6 text-white">
      <div className="flex items-start gap-4">
        <Mail className="w-8 h-8 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2">
            Get Exclusive Offers!
          </h3>
          <p className="text-white/90 mb-4">
            Subscribe to our newsletter for special promotions and new menu updates.
          </p>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-4 py-2 rounded-lg text-anon-eerie-black focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-white text-anon-salmon-pink font-bold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Subscribe'}
            </button>
          </form>

          {error && (
            <p className="text-white/90 text-anon-8 mt-2">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
