import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@tanjai/ui', 'next-intl'],
  i18n: {
    locales: ['th', 'en'],
    defaultLocale: 'th',
  },
};

export default nextConfig;
