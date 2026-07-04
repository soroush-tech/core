import type { Page } from '@playwright/test'
import { test, expect } from 'src/test/e2e/fixtures'

// The gist list is prerendered (SSG, see +data.ts), then useGists refetches on mount
// (staleTime 0). That client refetch briefly mounts a CircularProgress loader, which
// unmounts once the (mocked) query resolves. Waiting for that loader to be gone lets us
// assert the resolved data, never the loading state. (We wait on its terminal `hidden`
// state rather than `visible` — the loader can resolve faster than Playwright observes
// it mounted, but "gone" is unambiguous.)
const waitForLoaded = async (page: Page) => {
  await page.getByRole('progressbar', { name: 'Loading' }).waitFor({ state: 'hidden' })
}

test('articles page lists the mocked gists and exposes its meta tags', async ({ page }) => {
  await page.goto('/articles')
  await waitForLoaded(page)

  await expect(page).toHaveTitle('Articles · SOROUSH.TECH')
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    'Articles and notes on software engineering, architecture, and developer workflow.'
  )
  await expect(page.getByRole('heading', { level: 1, name: 'Articles' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Mock Article Title' })).toBeVisible()
})

test('navigates from the articles list to an article via client routing', async ({ page }) => {
  await page.goto('/articles')
  // Wait for hydration so Vike intercepts the click; the loader's `hidden` state alone can
  // resolve before it ever mounts, letting the anchor do a full document navigation instead.
  await page.waitForLoadState('networkidle')

  // Tag the window so we can prove the navigation stayed client-side (no full reload).
  await page.evaluate(() => ((window as Window & { __noReload?: boolean }).__noReload = true))

  await page.getByRole('link', { name: 'Mock Article Title' }).click()

  await expect(page).toHaveURL('/article/mock-gist-id/')
  expect(await page.evaluate(() => (window as Window & { __noReload?: boolean }).__noReload)).toBe(
    true
  )
  // Title is recomputed client-side on navigation (see +title / onRenderClient).
  await expect(page).toHaveTitle('Mock Article Title by Masoud Soroush · SOROUSH.TECH')
})
