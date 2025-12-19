import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Import locale files statically
import th from '../../locales/th.json';
import en from '../../locales/en.json';

// Supported locales
export const locales = ['th', 'en'] as const;
export type Locale = (typeof locales)[number];

const messages = {
  th,
  en,
};

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  return {
    messages: messages[locale as Locale],
  };
});
