import { test, expect } from 'src/test/e2e/fixtures'

const NAME = '@soroush.tech/playwright-coverage'

test('playwright-coverage package page renders the hero and README body, with meta', async ({
  page,
}) => {
  await page.goto('/playwright-coverage/')

  await expect(page).toHaveTitle(`${NAME} · SOROUSH.TECH`)
  await expect(page.getByRole('heading', { level: 1, name: NAME })).toBeVisible()
  await expect(page.getByRole('link', { name: 'VIEW_ON_NPM' })).toHaveAttribute(
    'href',
    'https://www.npmjs.com/package/@soroush.tech/playwright-coverage'
  )
  // The README body is rendered (its title/badges are stripped, `##` sections remain).
  await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible()
})
