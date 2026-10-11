import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
const phase = process.argv[2] || 'after'
const base = 'output/website-v2/' + phase
await mkdir(base, { recursive: true })
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] })
const results = []
for (const [name, viewport, colorScheme] of [
  ['desktop-light', { width: 1440, height: 1000 }, 'light'],
  ['desktop-dark', { width: 1440, height: 1000 }, 'dark'],
  ['mobile-light', { width: 375, height: 812 }, 'light'],
  ['narrow-dark', { width: 320, height: 740 }, 'dark'],
]) {
  for (let run = 1; run <= 3; run++) {
    const page = await browser.newPage({ viewport, colorScheme })
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.addInitScript(() => {
      window.vitals = { lcp: 0, cls: 0 }
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) window.vitals.lcp = e.startTime
      }).observe({ type: 'largest-contentful-paint', buffered: true })
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) if (!e.hadRecentInput) window.vitals.cls += e.value
      }).observe({ type: 'layout-shift', buffered: true })
    })
    await page.goto('http://127.0.0.1:4175', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)
    const metrics = await page.evaluate(() => ({
      ...window.vitals,
      fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
      resourceBytes: performance
        .getEntriesByType('resource')
        .filter((r) => r.name.startsWith(location.origin))
        .reduce((sum, r) => sum + r.transferSize, 0),
      overflow: document.documentElement.scrollWidth > innerWidth,
      canvasCount: document.querySelectorAll('canvas').length,
    }))
    if (run === 1) {
      await page.screenshot({ path: `${base}/${name}.png`, fullPage: true })
      await page.screenshot({ path: `${base}/${name}-hero.png` })
    }
    results.push({ name, run, ...metrics, errors })
    await page.close()
  }
}
await writeFile(`${base}/metrics.json`, JSON.stringify(results, null, 2))
console.log(JSON.stringify(results))
await browser.close()
