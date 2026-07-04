import { test, expect } from 'src/test/e2e/fixtures'

test('domain page renders the hero and all domain cards', async ({ page }) => {
  await page.goto('/domain')

  await expect(page).toHaveTitle('Delivery Domains · SOROUSH.TECH')

  // Hero
  await expect(page.getByText('DELIVERY STATUS: OPERATIONAL')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('DOMAINS')
  await expect(
    page.getByText(/complex systems get architected, scaled, and shipped under load/)
  ).toBeVisible()

  // One card per domain (each DomainCard title is an h2)
  await expect(page.getByRole('heading', { level: 2 })).toHaveCount(11)

  // A featured card with its title, image, and tags
  await expect(
    page.getByRole('heading', { level: 2, name: 'FULL-STACK SYSTEMS ARCHITECTURE' })
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 2, name: 'BATTLE-TESTED TECH LEADERSHIP' })
  ).toBeVisible()
  await expect(
    page.getByRole('img', { name: 'Soroush Mascot Full-Stack Systems Architect' })
  ).toBeVisible()
  await expect(page.getByText('API_DESIGN')).toBeVisible()
})

test('about page links through to the domain page', async ({ page }) => {
  await page.goto('/about')

  await page.getByRole('link', { name: 'ALL_DOMAINS' }).click()

  await expect(page).toHaveURL(/\/domain\/$/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('DOMAINS')
})
