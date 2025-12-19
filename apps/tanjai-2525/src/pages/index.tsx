'use client';

import { useLiff } from '@/providers/LiffProvider';
import { useTranslations } from 'next-intl';
import { ProductCatalog } from '@/features/catalog/ProductCatalog';
import { CartSheet } from '@/features/cart/CartSheet';
import { GetStaticPropsContext } from 'next';

export default function Home() {
  const { isInitializing, isLoggedIn, profile, error, login } = useLiff();
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

  // Show Error State
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-8">
        <div className="max-w-md text-center space-y-4">
          <div className="text-red-500 text-6xl">⚠</div>
          <h2 className="text-2xl font-bold text-white">LIFF Initialization Failed</h2>
          <p className="text-zinc-400">{error}</p>
          <p className="text-zinc-500 text-sm">Please open this page in LINE app</p>
        </div>
      </div>
    );
  }

  // Show Login Screen
  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-950 p-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h1 className="text-5xl font-bold text-amber-500 mb-2">{t('app.title')}</h1>
            <p className="text-zinc-400 text-sm">{t('app.subtitle')}</p>
          </div>
          <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-2xl p-6 space-y-4">
            <p className="text-zinc-300">{t('liff.loginRequired')}</p>
            <button
              onClick={login}
              className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold rounded-lg hover:from-amber-400 hover:to-orange-400 transition-all transform hover:scale-105"
            >
              {t('liff.loginButton')}
            </button>
          </div>
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

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../locales/${locale}.json`)).default,
    },
  };
}
