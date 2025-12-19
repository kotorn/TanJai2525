import type { Metadata } from 'next';
import { Inter, Noto_Sans_Thai } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { LiffProvider } from '@/providers/LiffProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const notoSansThai = Noto_Sans_Thai({ subsets: ['thai'], variable: '--font-noto-thai' });

export const metadata: Metadata = {
  title: 'TanJai 2525 - LINE LIFF POS',
  description: 'Mission 2525: LIFF Integration & Loyverse Connector',
};

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Fetch translations for current locale
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${notoSansThai.variable}`}>
      <body className="font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <LiffProvider>{children}</LiffProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
