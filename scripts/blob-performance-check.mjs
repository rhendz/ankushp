import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'

const phase = process.argv[2] || 'revised'
const output = `output/website-v2/${phase}`
const target = process.env.BLOB_PERF_URL || 'http://127.0.0.1:4175'
const duration = Number(process.env.BLOB_PERF_SAMPLE_MS || 10000)
const backend = process.env.BLOB_PERF_BACKEND || 'swiftshader'
await mkdir(output, { recursive: true })
const browser = await chromium.launch({
  args: backend === 'metal' ? ['--use-angle=metal'] : ['--enable-unsafe-swiftshader'],
})
const results = []
try {
  for (const scenario of [
    'desktop-idle',
    'desktop-pointer',
    'compact-idle',
    'desktop-light',
    'compact-light',
  ]) {
    for (let run = 1; run <= 3; run++) {
      const compact = scenario.startsWith('compact')
      const page = await browser.newPage({
        viewport: compact ? { width: 375, height: 812 } : { width: 1440, height: 1000 },
        deviceScaleFactor: 2,
        colorScheme: scenario.endsWith('light') ? 'light' : 'dark',
        reducedMotion: 'no-preference',
      })
      await page.addInitScript(() => {
        window.blobSamples = []
        window.blobRecording = false
        for (const method of ['drawElements', 'drawArrays']) {
          const original = WebGL2RenderingContext.prototype[method]
          WebGL2RenderingContext.prototype[method] = function (...args) {
            const result = original.apply(this, args)
            if (window.blobRecording && this.canvas.closest('[data-testid="blob-stage"]')) {
              const count = method === 'drawElements' ? args[1] : args[2]
              window.blobSamples.push({
                time: performance.now(),
                triangles: args[0] === this.TRIANGLES ? count / 3 : 0,
                lines: args[0] === this.LINES ? count / 2 : 0,
                width: this.drawingBufferWidth,
                height: this.drawingBufferHeight,
              })
            }
            return result
          }
        }
      })
      await page.goto(target, { waitUntil: 'networkidle' })
      const scene = page.locator('[data-testid="blob-canvas"][data-ready="true"]')
      await scene.waitFor()
      await scene.scrollIntoViewIfNeeded()
      await page.waitForTimeout(2000)
      await page.evaluate((pointer) => {
        window.blobRecording = true
        if (!pointer) return
        const scene = document.querySelector('[data-testid="blob-canvas"]')
        const bounds = scene.getBoundingClientRect()
        let angle = 0
        window.blobPointerTimer = setInterval(() => {
          angle += 0.09
          scene.dispatchEvent(
            new PointerEvent('pointermove', {
              clientX: bounds.left + bounds.width * (0.5 + Math.cos(angle) * 0.35),
              clientY: bounds.top + bounds.height * (0.5 + Math.sin(angle) * 0.3),
              pointerType: 'mouse',
            })
          )
        }, 16)
      }, scenario === 'desktop-pointer')
      await page.waitForTimeout(duration)
      const sample = await page.evaluate(() => {
        window.blobRecording = false
        clearInterval(window.blobPointerTimer)
        const canvas = document.querySelector('[data-testid="blob-canvas"] canvas')
        const gl = canvas.getContext('webgl2')
        const ext = gl.getExtension('WEBGL_debug_renderer_info')
        return {
          draws: window.blobSamples,
          renderer: ext
            ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)
            : gl.getParameter(gl.RENDERER),
          dpr: devicePixelRatio,
          cssWidth: canvas.getBoundingClientRect().width,
        }
      })
      const intervals = sample.draws
        .slice(1)
        .map((draw, index) => draw.time - sample.draws[index].time)
      const sorted = [...intervals].sort((a, b) => a - b)
      const percentile = (p) =>
        sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] ?? null
      results.push({
        scenario,
        run,
        durationMs: duration,
        observedSpanMs:
          sample.draws.length > 1 ? sample.draws.at(-1).time - sample.draws[0].time : 0,
        browser: browser.version(),
        renderer: sample.renderer,
        devicePixelRatio: sample.dpr,
        cssWidth: sample.cssWidth,
        drawCount: sample.draws.length,
        trianglesPerDraw: [...new Set(sample.draws.map((d) => d.triangles))],
        linesPerDraw: [...new Set(sample.draws.map((d) => d.lines))],
        bufferSizes: [...new Set(sample.draws.map((d) => `${d.width}x${d.height}`))],
        intervalP50Ms: percentile(0.5),
        intervalP95Ms: percentile(0.95),
        framesOver25ms: intervals.filter((value) => value > 25).length,
        stallsOver50ms: intervals.filter((value) => value > 50).length,
        missed60HzSlots: intervals.reduce(
          (sum, value) => sum + Math.max(0, Math.round(value / (1000 / 60)) - 1),
          0
        ),
      })
      await page.close()
    }
  }
  await writeFile(`${output}/animation-metrics.json`, JSON.stringify(results, null, 2))
  console.log(JSON.stringify(results, null, 2))
} finally {
  await browser.close()
}
