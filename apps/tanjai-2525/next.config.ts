import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@tanjai/ui', '@tanjai/database'],
  i18n: {
    locales: ['th', 'en'],
    defaultLocale: 'th',
  },
};

export default nextConfig;
