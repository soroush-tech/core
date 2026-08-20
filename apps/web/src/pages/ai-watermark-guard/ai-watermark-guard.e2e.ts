import { test, expect } from 'src/test/e2e/fixtures'

const NAME = 'ai-watermark-guard'

test('package page renders the hero and README body, with meta', async ({ page }) => {
  await page.goto('/ai-watermark-guard/')

  await expect(page).toHaveTitle(`${NAME} · SOROUSH.TECH`)
  await expect(page.getByRole('heading', { level: 1, name: NAME })).toBeVisible()
  await expect(page.getByRole('link', { name: 'VIEW_ON_NPM' })).toHaveAttribute(
    'href',
    'https://www.npmjs.com/package/ai-watermark-guard'
  )
  // The README body is rendered (its title/badges are stripped, `##` sections remain).
  await expect(page.getByRole('heading', { name: 'Install' })).toBeVisible()
  // The section that keeps the name honest about what the tool does and does not do.
  await expect(page.getByRole('heading', { name: 'What this is not' })).toBeVisible()

  // Wait for the client app to hydrate so +Page executes and e2e coverage records it.
  // Keyed on the React root being attached to #root by +onRenderClient, rather than on
  // `networkidle`: quiet network traffic says nothing about whether the app has hydrated,
  // and Playwright discourages it for exactly that reason.
  await page.waitForFunction(() =>
    Object.keys(document.getElementById('root') ?? {}).some((key) =>
      key.startsWith('__reactContainer$')
    )
  )
})
