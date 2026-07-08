import { test, expect } from 'src/test/e2e/fixtures'

test('design system page renders all sections', async ({ page }) => {
  await page.goto('/design/system')

  await expect(page).toHaveTitle('Design System · SOROUSH.TECH')
  await expect(page.getByRole('heading', { level: 1, name: 'Design System' })).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 2, name: '01 . Layout & Surfaces' })
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 2, name: '02 . Content & Data Display' })
  ).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: '03 . Inputs & Forms' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: '04 . Feedback' })).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 2, name: '05 . Overlay & Behavior' })
  ).toBeVisible()
})

test('data-display table sorts and paginates', async ({ page }) => {
  await page.goto('/design/system')
  // The page is server-rendered; wait for hydration so the controls are interactive.
  await page.waitForLoadState('networkidle')

  // The sortable/paginated table — anchored by its unique "Latency (ms)" sort header.
  const table = page
    .locator('table')
    .filter({ has: page.getByRole('button', { name: 'Latency (ms)' }) })
  const bodyRows = table.locator('tbody tr')
  const firstService = () => bodyRows.first().getByRole('cell').first()
  await expect(bodyRows).toHaveCount(5)
  await expect(firstService()).toHaveText('web')

  // Sort by Service — first click sorts descending, second flips to ascending.
  const serviceSort = table.getByRole('button', { name: 'Service' })
  await serviceSort.click()
  await expect(firstService()).toHaveText('worker')
  await serviceSort.click()
  await expect(firstService()).toHaveText('api')

  // Page forward — the second page holds the remaining rows.
  await table.getByRole('button', { name: 'Go to next page' }).click()
  await expect(bodyRows).toHaveCount(5)
})
