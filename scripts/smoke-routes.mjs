const baseUrl = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
const campaignId = process.env.CAMPAIGN_ID || 'd63d202a-255b-4284-97c1-ebc1c8d2d78e'

const checks = [
  { name: 'Home page', path: '/' },
  { name: 'Campaign listing page', path: '/campaigns' },
  { name: 'Campaign detail route', path: `/campaigns/${campaignId}` },
  { name: 'Health endpoint', path: '/api/health', expectJson: true },
]

async function run() {
  console.log(`Smoke test base URL: ${baseUrl}`)
  let failed = 0

  for (const check of checks) {
    const url = `${baseUrl}${check.path}`
    try {
      const res = await fetch(url, { method: 'GET', redirect: 'manual' })

      const isPass = res.status >= 200 && res.status < 400
      if (!isPass) {
        failed++
        console.error(`FAIL ${check.name}: ${url} -> ${res.status}`)
        continue
      }

      if (check.expectJson) {
        const contentType = res.headers.get('content-type') || ''
        if (!contentType.includes('application/json')) {
          failed++
          console.error(`FAIL ${check.name}: ${url} -> expected JSON, got ${contentType || 'unknown'}`)
          continue
        }
      }

      console.log(`PASS ${check.name}: ${url} -> ${res.status}`)
    } catch (err) {
      failed++
      const message = err instanceof Error ? err.message : String(err)
      console.error(`FAIL ${check.name}: ${url} -> ${message}`)
    }
  }

  if (failed > 0) {
    console.error(`\nSmoke tests failed: ${failed} check(s)`)
    process.exit(1)
  }

  console.log('\nSmoke tests passed')
}

run()
