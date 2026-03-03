/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'rzrsmdykbprffhksxuja.supabase.co' },
    ],
  },
}

module.exports = nextConfig
