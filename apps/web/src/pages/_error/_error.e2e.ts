import { test, expect } from 'src/test/e2e/fixtures'

// Any unmatched path renders the Vike error page. In production Vike pre-renders this
// same page to 404.html, which GitHub Pages serves for deep links / refreshes that have
// no static file — booting the client router so it can still resolve the real route.
test('renders the 404 section for an unknown route', async ({ page }) => {
  await page.goto('/this-route-does-not-exist')

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('404')

  // The error page must not be indexed.
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,follow')

  // Recovery path back to the site — the only link inside the error section.
  await expect(page.getByRole('main').getByRole('link')).toHaveAttribute('href', '/')
})
