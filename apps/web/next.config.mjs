import path from 'path'
import { fileURLToPath } from 'url'
import withPWAInit from "@ducanh2912/next-pwa"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const withPWA = withPWAInit({
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    register: true,
    skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    experimental: {
        serverComponentsExternalPackages: ['@supabase/ssr', '@supabase/supabase-js'],
    },
    transpilePackages: ['@tanjai/ui'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
};

export default withPWA(nextConfig);
