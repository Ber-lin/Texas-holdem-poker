/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 移除可能导致问题的配置
  // output: 'standalone',
  // experimental: {
  //   optimizePackageImports: ['lucide-react']
  // },
}

export default nextConfig
