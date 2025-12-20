'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CreditCard, Upload, Loader2, CheckCircle } from 'lucide-react';
import { uploadPaymentSlip } from '@/features/subscription/actions/upload-slip';
import { toast } from 'sonner';

// Note: To make this robust, we'd need to fetch the tenant slug. 
// For this MVP, we might need to rely on the user knowing it, or retrieve it via a client session.
// However, since this page is global (/subscription/expired), we might lose context of WHICH tenant.
// Solution: Pass tenant slug as query param when redirecting.
// Update: `tenant-auth.ts`: `redirect('/subscription/expired?tenant=' + tenantSlug);`

export default function SubscriptionExpiredPage({
  searchParams
}: {
  searchParams: { tenant?: string; status?: string }
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const tenantSlug = searchParams.tenant;

  async function handleSubmit(formData: FormData) {
    if (!tenantSlug) {
      toast.error('Tenant ID missing. Please return to your shop link.');
      return;
    }

    setIsUploading(true);
    formData.append('tenant_slug', tenantSlug);

    try {
      await uploadPaymentSlip(formData);
      setIsSuccess(true);
      toast.success('Payment slip uploaded successfully!');
    } catch (e: any) {
      toast.error(e.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-900 border border-green-900/50 rounded-2xl p-8 shadow-2xl text-center">
          <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Upload Received</h1>
          <p className="text-gray-400 mb-8">
            Your payment slip is being verified. We will notify you once your access is restored.
          </p>
          <Link
            href={`/`}
            className="block w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 px-4 rounded-xl transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (searchParams.status === 'pending') {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-900 border border-yellow-900/50 rounded-2xl p-8 shadow-2xl text-center">
          <div className="mx-auto w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6">
            <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Verification Pending</h1>
          <p className="text-gray-400 mb-8">
            Your payment slip is currently being reviewed by our team. <br />
            Please check back later.
          </p>

          <Link
            href="https://m.me/tanjai"
            target="_blank"
            className="block w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 px-4 rounded-xl transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl text-center">
        <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Subscription Expired</h1>
        <p className="text-gray-400 mb-8">
          Your access to the platform has been paused. Please renew your subscription to continue.
        </p>

        {tenantSlug ? (
          <form action={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Amount Paid (฿)</label>
              <input
                type="number"
                name="amount"
                required
                placeholder="e.g. 599"
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Payment Slip</label>
              <div className="relative">
                <input
                  type="file"
                  name="slip_image"
                  accept="image/*"
                  required
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {isUploading ? <Loader2 className="animate-spin" /> : <Upload size={18} />}
              {isUploading ? 'Uploading...' : 'Upload Payment Slip'}
            </button>
          </form>
        ) : (
          <div className="bg-yellow-500/10 p-4 rounded-lg text-yellow-500 text-sm">
            No store context found. Please open this page from your Store Dashboard.
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-800">
          <Link
            href="https://m.me/tanjai"
            target="_blank"
            className="block w-full text-gray-500 hover:text-white text-sm transition-colors"
          >
            Contact Support for Help
          </Link>
        </div>
      </div>
    </div>
  );
}
