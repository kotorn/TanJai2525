import type { Metadata } from 'next';
import { Inter, Noto_Sans_Thai, Plus_Jakarta_Sans, Noto_Sans } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const notoSansThai = Noto_Sans_Thai({
    subsets: ['thai', 'latin'],
    variable: '--font-thai',
    weight: ['300', '400', '500', '600', '700'],
});
const plusJakarta = Plus_Jakarta_Sans({
    subsets: ['latin'],
    variable: '--font-plus-jakarta',
    weight: ['400', '500', '600', '700', '800'],
});
const notoSans = Noto_Sans({
    subsets: ['latin'],
    variable: '--font-noto-sans',
    weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
    title: 'Tanjai POS',
    description: 'Smart POS for Street Food',
    manifest: '/manifest.json',
};

import { NetworkStatus } from '@/components/ui/network-status';
import { ReactQueryProvider } from '@/providers/react-query-provider';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <head>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
            </head>
            <body className={`${inter.variable} ${notoSansThai.variable} ${plusJakarta.variable} ${notoSans.variable} font-sans antialiased bg-[#121212] text-[#E0E0E0]`}>
                <ReactQueryProvider>
                    <FeatureFlagProvider>
                        {children}
                        <Toaster position="top-center" />
                        <NetworkStatus />
                    </FeatureFlagProvider>
                </ReactQueryProvider>
                <Script
// ... rest of file
// ... rest of file (script tag)
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
