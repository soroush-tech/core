import { test, expect } from 'src/test/e2e/fixtures'

const NAME = '@soroush.tech/vite-plugin-msw-server'

test('package page renders the hero and README body, with meta', async ({ page }) => {
  await page.goto('/vite-plugin-msw-server/')

  await expect(page).toHaveTitle(`${NAME} · SOROUSH.TECH`)
  await expect(page.getByRole('heading', { level: 1, name: NAME })).toBeVisible()
  await expect(page.getByRole('link', { name: 'VIEW_ON_NPM' })).toHaveAttribute(
    'href',
    'https://www.npmjs.com/package/@soroush.tech/vite-plugin-msw-server'
  )
  // The README body is rendered (its title/badges are stripped, `##` sections remain).
  await expect(page.getByRole('heading', { name: 'Install' })).toBeVisible()

  // Wait for the client app to hydrate so +Page executes (captured by e2e coverage).
  await page.waitForLoadState('networkidle')
})
