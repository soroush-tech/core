import { test, expect } from 'src/test/e2e/fixtures'

const NAME = '@soroush.tech/vite-plugin-msw-server'

test('npm index lists packages and links to each detail page', async ({ page }) => {
  await page.goto('/npm/')

  await expect(page).toHaveTitle('npm Packages · SOROUSH.TECH')
  await expect(page.getByRole('heading', { level: 1, name: 'NPM Packages' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: NAME })).toBeVisible()

  const detail = page.getByRole('link', { name: NAME })
  await expect(detail).toHaveAttribute('href', '/vite-plugin-msw-server/')

  await detail.click()
  // Link href is the canonical trailing-slash URL; Vike normalizes the client URL without it.
  await expect(page).toHaveURL(/\/vite-plugin-msw-server\/?$/)
  await expect(
    page.getByRole('heading', { level: 1, name: '@soroush.tech/vite-plugin-msw-server' })
  ).toBeVisible()
})
