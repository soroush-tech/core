import { test, expect } from 'src/test/e2e/fixtures'

test('design system page renders all sections', async ({ page }) => {
  await page.goto('/design/system')

  await expect(page).toHaveTitle('Design System · SOROUSH.TECH')
  await expect(page.getByRole('heading', { level: 1, name: 'Design System' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: '01 . Typography' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: '02 . Core Layout' })).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 2, name: '03 . Interactive Controls' })
  ).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: '04 . Media' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: '05 . Color & Size' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: '06 . Data Display' })).toBeVisible()
})

test('data-display table sorts and paginates', async ({ page }) => {
  await page.goto('/design/system')
  // The page is server-rendered; wait for hydration so the controls are interactive.
  await page.waitForLoadState('networkidle')

  const section = page.locator('#data-display')
  await section.scrollIntoViewIfNeeded()
  const bodyRows = section.locator('tbody tr')
  const firstService = () => bodyRows.first().getByRole('cell').first()
  await expect(bodyRows).toHaveCount(5)
  await expect(firstService()).toHaveText('web')

  // Sort by Service — first click sorts descending, second flips to ascending.
  const serviceSort = section.getByRole('button', { name: 'Service' })
  await serviceSort.click()
  await expect(firstService()).toHaveText('worker')
  await serviceSort.click()
  await expect(firstService()).toHaveText('api')

  // Page forward — the second page holds the remaining rows.
  await section.getByRole('button', { name: 'Go to next page' }).click()
  await expect(bodyRows).toHaveCount(5)
})
