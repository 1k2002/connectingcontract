/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["gateway.pinata.cloud"],
    formats: ["image/webp"],
  },
};

module.exports = nextConfig
