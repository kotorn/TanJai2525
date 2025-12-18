'use client';

import { Tag, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface CouponInputProps {
  orderAmount: number;
  onCouponApplied: (discount: number, couponCode: string) => void;
  onCouponRemoved: () => void;
}

export function CouponInput({ orderAmount, onCouponApplied, onCouponRemoved }: CouponInputProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string; discount: number} | null>(null);
  
  const supabase = createClient();

  const handleApply = async () => {
    if (!code.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Call Supabase function to validate coupon
      const { data, error: rpcError } = await supabase.rpc('validate_coupon', {
        p_code: code.toUpperCase(),
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_order_amount: orderAmount,
      });

      if (rpcError) throw rpcError;

      const result = data[0];

      if (!result.is_valid) {
        setError(result.message);
        return;
      }

      // Apply coupon
      setAppliedCoupon({ code: code.toUpperCase(), discount: result.discount_amount });
      onCouponApplied(result.discount_amount, code.toUpperCase());
      setCode('');
    } catch (err: any) {
      setError(err.message || 'Failed to apply coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setAppliedCoupon(null);
    onCouponRemoved();
  };

  if (appliedCoupon) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Tag className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-bold text-green-900">{appliedCoupon.code}</p>
              <p className="text-anon-8 text-green-700">-฿{appliedCoupon.discount.toFixed(2)}</p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="text-anon-8 text-green-700 hover:text-green-900 font-medium"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-anon-7 font-medium text-anon-eerie-black">
        Coupon Code
      </label>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-anon-sonic-silver" />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === 'Enter' && handleApply()}
            placeholder="Enter coupon code"
            className="w-full pl-10 pr-4 py-2 border border-anon-cultured rounded-lg focus:border-anon-salmon-pink focus:outline-none focus:ring-2 focus:ring-anon-salmon-pink/20"
          />
        </div>
        <button
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="px-6 py-2 bg-anon-salmon-pink hover:bg-anon-sandy-brown text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Apply'}
        </button>
      </div>
      {error && (
        <p className="text-anon-8 text-red-600">{error}</p>
      )}
    </div>
  );
}
