/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
    "missingSuspenseWithCSRBailout": false,
  },
  typescript: {
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
