import type { Metadata } from 'next';
import { Inter, Noto_Sans_Thai } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const notoSansThai = Noto_Sans_Thai({
    subsets: ['thai', 'latin'],
    variable: '--font-thai',
    weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
    title: 'Tanjai POS',
    description: 'Smart POS for Street Food',
    manifest: '/manifest.json',
};

import { FeatureFlagProvider } from '@/features/flags/FeatureFlagProvider';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${notoSansThai.variable} font-sans antialiased`}>
                <FeatureFlagProvider>
                    {children}
                    <Toaster position="top-center" />
                </FeatureFlagProvider>
                <Script
                    id="register-sw"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
                    }}
                />
            </body>
        </html>
    );
}
