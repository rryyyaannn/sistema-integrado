import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Os packages do monorepo sao consumidos como TypeScript-fonte; o Next
  // precisa transpila-los.
  transpilePackages: ['@si/core', '@si/types', '@si/ui-tokens'],
};

export default nextConfig;
