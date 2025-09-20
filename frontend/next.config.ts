import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  trailingSlash: true,
  assetPrefix: isProd ? process.env.BASE_URL : '',
  basePath: isProd ? process.env.BASE_URL : '',
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['@chakra-ui/react'],
  },
};

export default nextConfig;

