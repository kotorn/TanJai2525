import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  /* config options here */
};

// @ts-expect-error - Type conflict between Next.js versions in monorepo (next-intl not yet fully compatible with Next.js 16)
export default withNextIntl(nextConfig);
