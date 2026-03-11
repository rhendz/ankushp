import { chromium } from '@playwright/test'

const targetUrl = process.env.HOME_VISUAL_HEALTH_URL || 'https://www.ankushp.com'
const timeoutMs = Number(process.env.HOME_VISUAL_HEALTH_TIMEOUT_MS || 20000)
const settleMs = Number(process.env.HOME_VISUAL_HEALTH_SETTLE_MS || 3000)

const crashSignatures = [
  /ReactCurrentBatchConfig/i,
  /Cannot read properties of undefined \(reading 'ReactCurrentBatchConfig'\)/i,
  /Home 3D scene failed to render\.\s*TypeError/i,
]

const ignoredSignatures = [
  /Error creating WebGL context/i,
  /A WebGL context could not be created/i,
]

const browser = await chromium.launch({
  headless: true,
  args: ['--ignore-gpu-blocklist', '--use-gl=swiftshader'],
})

const page = await browser.newPage()
const collectedErrors = []

page.on('console', (message) => {
  if (message.type() === 'error') {
    collectedErrors.push(`console: ${message.text()}`)
  }
})

page.on('pageerror', (error) => {
  collectedErrors.push(`pageerror: ${error.message}`)
})

try {
  await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: timeoutMs })
  await page.waitForTimeout(settleMs)

  const domSignals = await page.evaluate(() => ({
    canvasCount: document.querySelectorAll('canvas').length,
    fallbackShapeCount: document.querySelectorAll('.hero-visual-shape').length,
  }))

  const actionableErrors = collectedErrors.filter(
    (err) => !ignoredSignatures.some((pattern) => pattern.test(err))
  )

  const crashHits = actionableErrors.filter((err) =>
    crashSignatures.some((pattern) => pattern.test(err))
  )

  const summary = {
    url: targetUrl,
    canvasCount: domSignals.canvasCount,
    fallbackShapeCount: domSignals.fallbackShapeCount,
    errorCount: actionableErrors.length,
    errors: actionableErrors.slice(0, 10),
  }

  if (crashHits.length > 0) {
    console.error('Home visual health check failed. Crash signature detected.')
    console.error(JSON.stringify(summary, null, 2))
    process.exit(1)
  }

  console.log('Home visual health check passed.')
  console.log(JSON.stringify(summary, null, 2))
} finally {
  await browser.close()
}
