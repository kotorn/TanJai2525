'use client';

import { useLiff } from '@/providers/LiffProvider';
import { useTranslations } from 'next-intl';
import { ProductCatalog } from '@/features/catalog/ProductCatalog';
import { CartSheet } from '@/features/cart/CartSheet';

export default function Home() {
  const { isInitializing, isLoggedIn, profile, supabaseUser, error, login } = useLiff();
  const t = useTranslations();

  // Show Loading during LIFF init
  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-500 border-t-transparent" />
          <p className="text-zinc-400 animate-pulse">{t('app.initializing')}</p>
        </div>
      </div>
    );
  }

  // Show Error if any
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-zinc-950">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
          <p className="text-red-400 font-bold">{t('common.error')}</p>
          <p className="text-red-300/80 text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  // Not Logged In
  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-zinc-950">
        <div className="max-w-md w-full space-y-8 text-center">
          <h1 className="text-5xl font-bold text-amber-500">{t('app.title')}</h1>
          <p className="text-zinc-400">{t('app.subtitle')}</p>
          <button
            onClick={login}
            className="w-full px-6 py-4 bg-amber-600 text-white font-black rounded-2xl shadow-lg shadow-amber-900/20 active:scale-95 transition-transform"
          >
            {t('app.loginButton')}
          </button>
        </div>
      </div>
    );
  }

  // Logged in but waiting for Supabase sync
  if (!supabaseUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent" />
          <p className="text-zinc-400">{t('app.syncingSupabase')}</p>
        </div>
      </div>
    );
  }

  // Full POS Interface
  return (
    <main className="min-h-screen bg-zinc-950 text-white pb-20">
      <header className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur-md p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-amber-500">{t('app.title')}</h1>
            <p className="text-xs text-zinc-500">Welcome, {profile?.displayName}</p>
          </div>
          {profile?.pictureUrl && (
            <img src={profile.pictureUrl} alt="" className="w-8 h-8 rounded-full ring-2 ring-amber-500/30" />
          )}
        </div>
      </header>

      <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <ProductCatalog />
      </section>

      <CartSheet />
    </main>
  );
}
