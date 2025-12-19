import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { NextIntlClientProvider } from 'next-intl';
import { useRouter } from 'next/router';
import { LiffProvider } from '@/providers/LiffProvider';
import { CartProvider } from '@/features/cart/CartContext';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <NextIntlClientProvider
      locale={router.locale}
      messages={pageProps.messages}
      timeZone="Asia/Bangkok"
    >
      <LiffProvider>
        <CartProvider>
          <Component {...pageProps} />
        </CartProvider>
      </LiffProvider>
    </NextIntlClientProvider>
  );
}
