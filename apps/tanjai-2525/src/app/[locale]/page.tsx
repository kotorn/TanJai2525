'use client';

import { useLiff } from '@/providers/LiffProvider';
import { useTranslations } from 'next-intl';

export default function Home() {
  const { isInitializing, isLoggedIn, profile, error, login } = useLiff();
  const t = useTranslations();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-950">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* App Header */}
        <div>
          <h1 className="text-5xl font-bold text-amber-500 mb-2">
            {t('app.title')}
          </h1>
          <p className="text-zinc-400 text-sm">{t('app.subtitle')}</p>
        </div>

        {/* LIFF Status */}
        <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-2xl p-6 space-y-4">
          {isInitializing && (
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-amber-500 border-t-transparent" />
              <p className="text-zinc-300">{t('liff.initializing')}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400 text-sm font-medium">{t('common.error')}</p>
              <p className="text-red-300/80 text-xs mt-1">{error}</p>
            </div>
          )}

          {!isInitializing && !error && (
            <>
              {isLoggedIn && profile ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    {profile.pictureUrl && (
                      <img
                        src={profile.pictureUrl}
                        alt={profile.displayName}
                        className="w-16 h-16 rounded-full border-2 border-amber-500"
                      />
                    )}
                    <div className="text-left">
                      <p className="text-white font-semibold">
                        {t('common.welcome')}, {profile.displayName}
                      </p>
                      <p className="text-zinc-400 text-xs">User ID: {profile.userId}</p>
                    </div>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <p className="text-green-400 text-sm">✓ LIFF Initialized Successfully</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-zinc-300">{t('liff.loginRequired')}</p>
                  <button
                    onClick={login}
                    className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold rounded-lg hover:from-amber-400 hover:to-orange-400 transition-all transform hover:scale-105"
                  >
                    {t('liff.loginButton')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Info */}
        <div className="text-zinc-500 text-xs space-y-1">
          <p>🚀 Mission 2525: Phase 1 Complete</p>
          <p>LIFF SDK + i18n + Loyverse Ready</p>
        </div>
      </div>
    </div>
  );
}
