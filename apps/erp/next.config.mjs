import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@tanjai/ui"],
  webpack: (config, { isServer }) => {
    // Force webpack to use CJS version of supabase-js to avoid ESM wrapper issues
    config.resolve.alias = {
      ...config.resolve.alias,
      '@supabase/supabase-js': path.resolve(__dirname, '../../node_modules/@supabase/supabase-js/dist/main/index.js'),
    }
    return config
  },
};

export default nextConfig;
