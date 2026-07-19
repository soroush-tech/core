import { test, expect } from 'src/test/e2e/fixtures'

const NAME = '@soroush.tech/markdown'

test('package page renders the hero and README body, with meta', async ({ page }) => {
  await page.goto('/markdown/')

  await expect(page).toHaveTitle(`${NAME} · SOROUSH.TECH`)
  await expect(page.getByRole('heading', { level: 1, name: NAME })).toBeVisible()
  await expect(page.getByRole('link', { name: 'VIEW_ON_NPM' })).toHaveAttribute(
    'href',
    'https://www.npmjs.com/package/@soroush.tech/markdown'
  )
  // The README body is rendered (no leading title here, but its badge block is stripped).
  await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible()

  // Wait for the client app to hydrate so +Page executes (captured by e2e coverage).
  await page.waitForLoadState('networkidle')
})
