/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactCompiler: true,
  transpilePackages: ["three"],
};

export default nextConfig;
