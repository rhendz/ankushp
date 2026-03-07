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

    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control'
    await page.keyboard.press(`${modifier}+K`)

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
})
