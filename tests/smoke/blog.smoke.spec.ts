import { expect, test } from '@playwright/test'

test.describe('blog smoke suite', () => {
  test('blog landing page loads', async ({ page }) => {
    await page.goto('/blog')

    await expect(page).toHaveURL(/\/blog$/)
    await expect(page.getByRole('heading', { name: /Hi, I'm Ankush Patel/i })).toBeVisible()
  })

  test('a blog post page loads from posts index', async ({ page }) => {
    await page.goto('/blog/posts')

    const firstPostLink = page.locator('main h2 a[href^="/blog/posts/"]').first()
    await expect(firstPostLink).toBeVisible()
    await firstPostLink.click()

    await expect(page).toHaveURL(/\/blog\/posts\//)
    await expect(page.locator('main article')).toBeVisible()
  })

  test('kbar opens with cmd/ctrl+k on blog pages', async ({ page }) => {
    await page.goto('/blog')

    await expect(page.getByRole('button', { name: 'Open command menu' })).toBeVisible()

    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control'
    await page.keyboard.press(`${modifier}+K`)

    await expect(page.getByRole('dialog', { name: 'Command menu' })).toBeVisible()
    await expect(page.getByRole('combobox', { name: 'Search commands' })).toBeVisible()
    await expect(page.getByTestId('kbar-positioner')).toBeVisible()
    await expect(page.getByTestId('kbar-search-input')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.getByTestId('kbar-positioner')).toBeHidden()
  })

  test('newsletter CTA renders unavailable state when backend reports missing config', async ({
    page,
  }) => {
    const expectedMessage =
      'Newsletter subscriptions are currently unavailable due to missing configuration.'

    await page.route('**/api/newsletter', async (route) => {
      if (route.request().method() !== 'GET') {
        await route.continue()
        return
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          configured: false,
          message: expectedMessage,
        }),
      })
    })

    await page.goto('/blog')

    await expect(page.getByRole('heading', { name: /Subscribe to the newsletter/i })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Unavailable' })).toBeDisabled()
    await expect(page.getByText(expectedMessage)).toBeVisible()
  })

  test('post engagement rail supports like click/hold, copy feedback, and newsletter visibility', async ({
    page,
  }) => {
    await page.goto('/blog/posts/the-missing-layer-in-your-ai-stack-intermediate-knowledge')

    const engagementRail = page.getByTestId('engagement-rail')
    const likeButton = page.getByTestId('like-button')
    const likeCount = page.getByTestId('like-count')
    const copyLinkButton = page.getByTestId('copy-link-button')

    await expect(engagementRail).toBeVisible()
    await expect(likeButton).toBeVisible()
    await expect(likeCount).toBeVisible()
    await expect(copyLinkButton).toBeVisible()
    await expect(page.getByRole('heading', { name: /Enjoyed this post/i })).toBeVisible()

    const initialCount = Number((await likeCount.textContent())?.trim() || '0')

    await likeButton.click()
    await expect
      .poll(async () => Number((await likeCount.textContent())?.trim() || '0'))
      .toBeGreaterThan(initialCount)

    const afterClickCount = Number((await likeCount.textContent())?.trim() || '0')

    await likeButton.focus()
    await page.keyboard.press('Enter')
    await expect
      .poll(async () => Number((await likeCount.textContent())?.trim() || '0'))
      .toBeGreaterThan(afterClickCount)

    const afterKeyboardCount = Number((await likeCount.textContent())?.trim() || '0')
    await likeButton.hover()
    await page.mouse.down()
    await page.waitForTimeout(900)
    await page.mouse.up()

    await expect
      .poll(async () => Number((await likeCount.textContent())?.trim() || '0'))
      .toBeGreaterThan(afterKeyboardCount)

    await copyLinkButton.click()
    await expect(copyLinkButton).toHaveAttribute('aria-label', 'Link copied')
  })
})
