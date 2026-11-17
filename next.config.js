/** @type {import('next').NextConfig} */
const isStaticExport = process.env.STATIC_EXPORT === 'true';

const nextConfig = {
  ...(isStaticExport ? { output: 'export' } : {}),
  reactStrictMode: true,
  skipTrailingSlashRedirect: true,
  experimental: {
    serverComponentsExternalPackages: ['firebase-admin', 'jwks-rsa', 'jose'],
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.kalajay.in',
      },
      {
        protocol: 'https',
        hostname: 'kalajay.in',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

module.exports = nextConfig;
