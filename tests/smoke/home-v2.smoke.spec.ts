import { expect, test } from '@playwright/test'

// Headless CI needs an explicit software renderer to exercise the real shader.
test.use({ launchOptions: { args: ['--enable-unsafe-swiftshader'] } })

test('home presents work, selected writing, and a contact path from the blog', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Useful AI.')
  await page.getByRole('link', { name: 'Explore selected work' }).click()
  await expect(page).toHaveURL(/#work$/)
  await expect(page.locator('#work article')).toHaveCount(2)
  await expect(page.locator('#writing article')).toHaveCount(3)
  const post = page.locator('#writing article a').first()
  await post.click()
  await expect(page).toHaveURL(/\/blog\/posts\/how-i-think-about-reliability-in-agentic-workflows$/)
  await expect(page.locator('main article')).toBeVisible()
  await page
    .getByRole('navigation', { name: 'Main', exact: true })
    .getByRole('link', { name: 'Contact' })
    .click()
  await expect(page).toHaveURL(/\/#contact$/)
  await expect(page.locator('#contact a[href="mailto:ap@ankushp.com"]')).toBeVisible()
})

test('motion can be paused and theme changes keep the same renderer', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.emulateMedia({ reducedMotion: 'no-preference', colorScheme: 'dark' })
  await page.addInitScript(() => {
    for (const method of ['drawElements', 'drawArrays'] as const) {
      const draw = WebGL2RenderingContext.prototype[method]
      WebGL2RenderingContext.prototype[method] = function (...args) {
        const canvas = this.canvas as HTMLCanvasElement
        if (canvas.closest('[data-testid="blob-canvas"]')) {
          canvas.dataset.drawMode = args[0] === this.LINES ? 'wireframe' : 'solid'
        }
        return draw.apply(this, args)
      }
    }
  })
  await page.goto('/')
  const canvas = page.getByTestId('blob-canvas').locator('canvas')
  await expect(page.getByTestId('blob-canvas')).toHaveAttribute('data-ready', 'true')
  await expect(canvas).toHaveAttribute('data-draw-mode', 'solid')
  await page.getByRole('button', { name: 'Pause animation' }).click()
  // Pixel stability verifies the animation actually stopped, not just the label.
  const still = await canvas.screenshot()
  await page.waitForTimeout(200)
  expect(await canvas.screenshot()).toEqual(still)
  await canvas.evaluate((node) => node.setAttribute('data-original', 'true'))
  await page.getByRole('button', { name: 'Switch to light mode' }).click()
  await expect(canvas).toHaveAttribute('data-draw-mode', 'wireframe')
  await page.getByRole('button', { name: 'Switch to dark mode' }).click()
  await expect(canvas).toHaveAttribute('data-draw-mode', 'solid')
  await expect(canvas).toHaveAttribute('data-original', 'true')
  await expect(page.getByTestId('blob-fallback')).toBeHidden()
  await page.getByRole('button', { name: 'Resume animation' }).click()
  await expect(page.getByRole('button', { name: 'Pause animation' })).toBeEnabled()
  const animated = await canvas.screenshot()
  await page.waitForTimeout(200)
  expect(await canvas.screenshot()).not.toEqual(animated)
  expect(errors).toEqual([])
})

test('reduced motion uses a static visual and narrow navigation remains usable', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 })
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' })
  await page.goto('/')
  await expect(page.getByTestId('blob-fallback')).toBeVisible()
  await expect(page.locator('canvas')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Pause animation' })).toBeDisabled()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByRole('button', { name: 'Toggle Menu' }).click()
  await page.getByRole('link', { name: 'Contact', exact: true }).filter({ visible: true }).click()
  await expect(page.locator('#contact')).toBeInViewport()
  await expect(page.getByRole('button', { name: 'Toggle Menu' })).toHaveAttribute(
    'aria-expanded',
    'false'
  )
})

test('WebGL creation failure retains the static form and contact content', async ({ page }) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (String(type).startsWith('webgl')) return null
      return getContext.apply(this, [type, ...args])
    } as typeof getContext
  })
  await page.goto('/')
  await expect(page.getByText('Still form', { exact: true })).toBeVisible()
  await expect(page.getByTestId('blob-fallback')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Get in touch' })).toHaveAttribute(
    'href',
    'mailto:ap@ankushp.com'
  )
})

test('context loss returns to a visible static form', async ({ page }) => {
  await page.goto('/')
  const canvas = page.getByTestId('blob-canvas').locator('canvas')
  await expect(page.getByTestId('blob-canvas')).toHaveAttribute('data-ready', 'true')
  await canvas.evaluate((node) => {
    ;(node as HTMLCanvasElement)
      .getContext('webgl2')
      ?.getExtension('WEBGL_lose_context')
      ?.loseContext()
  })
  await expect(page.getByText('Still form', { exact: true })).toBeVisible()
  await expect(page.getByTestId('blob-fallback')).toBeVisible()
  await expect(page.locator('canvas')).toHaveCount(0)
})

test('offscreen and paused blobs submit no draw calls', async ({ page }) => {
  await page.addInitScript(() => {
    const draw = WebGL2RenderingContext.prototype.drawElements
    WebGL2RenderingContext.prototype.drawElements = function (...args) {
      const canvas = this.canvas as HTMLCanvasElement
      if (canvas.closest('[data-testid="blob-canvas"]')) {
        canvas.dataset.draws = String(Number(canvas.dataset.draws || 0) + 1)
      }
      return draw.apply(this, args)
    }
  })
  await page.goto('/')
  const canvas = page.getByTestId('blob-canvas').locator('canvas')
  await expect(page.getByTestId('blob-canvas')).toHaveAttribute('data-ready', 'true')
  const draws = () => canvas.getAttribute('data-draws')
  const assertStopped = async () => {
    await page.waitForTimeout(150)
    const count = await draws()
    expect(Number(count)).toBeGreaterThan(0)
    await page.waitForTimeout(300)
    expect(await draws()).toBe(count)
  }
  await page.locator('#contact').scrollIntoViewIfNeeded()
  await expect(canvas).not.toBeInViewport()
  await assertStopped()
  await canvas.scrollIntoViewIfNeeded()
  const offscreenCount = await draws()
  await expect.poll(draws).not.toBe(offscreenCount)
  await page.getByRole('button', { name: 'Pause animation' }).click()
  await assertStopped()
  await page.getByRole('button', { name: 'Resume animation' }).click()
  const pausedCount = await draws()
  await expect.poll(draws).not.toBe(pausedCount)
})

test('the introduction, work, and contact remain available without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Useful AI.')
  await expect(page.getByTestId('blob-fallback')).toBeVisible()
  await expect(page.locator('#work article')).toHaveCount(2)
  await expect(page.locator('#contact a[href="mailto:ap@ankushp.com"]')).toBeVisible()
  await context.close()
})
