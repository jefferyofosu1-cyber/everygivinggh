/** @type {import('next').NextConfig} */
const nextConfig = {

  // Security headers are consolidated in middleware.ts
  // HSTS is added here since it's purely declarative
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },

  // ── Image domains ──────────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cdn.sanity.io' },
    ],
  },

  // ── Silence noisy webpack warning ─────────────────────────────────────────
  webpack(config) {
    config.infrastructureLogging = { level: 'error' }
    return config
  },
}

module.exports = nextConfig
