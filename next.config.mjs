/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  transpilePackages: ["three"],
  experimental: {
    turbopackUseSystemTlsCerts: true,
  },
};

export default nextConfig;
