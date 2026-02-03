/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10gb",
    },
    middlewareClientMaxBodySize: "10gb",
  },
};

export default nextConfig;
