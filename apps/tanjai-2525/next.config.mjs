/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@tanjai/ui', '@tanjai/database'],
  i18n: {
    locales: ['th', 'en'],
    defaultLocale: 'th',
  },
};

export default nextConfig;
