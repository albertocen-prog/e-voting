/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    strictNullChecks: true,
  },
  eslint: {
    dirs: ['pages', 'components', 'lib'],
  },
};

module.exports = nextConfig;
