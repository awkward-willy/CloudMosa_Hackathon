import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  assetPrefix: isProd ? '/CloudMosa_Hackathon/' : '',
  basePath: isProd ? '/CloudMosa_Hackathon' : '',
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
};

export default nextConfig;
