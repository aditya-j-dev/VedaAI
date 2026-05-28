/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@vedaai/shared'],
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    // Required for pdfjs-dist
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
