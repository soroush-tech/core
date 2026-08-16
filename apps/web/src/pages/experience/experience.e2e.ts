import { test, expect } from 'src/test/e2e/fixtures'
import type { Locator, Page } from '@playwright/test'

// The experience page is the interactive D3 technology graph plus its legend sidebar.
// The legend is hidden below 1024px; the e2e desktop viewports (1280) show it. Driving
// the legend (stable HTML) also toggles the graph, so we assert through it rather than
// clicking moving SVG nodes. We scope to the legend - and to each area's own child list -
// because area/tech labels also appear as SVG node text, and a shared tech is listed
// under every area it belongs to.
const legend = (page: Page): Locator =>
  page.getByText('CATEGORIES', { exact: true }).locator('xpath=..')
const nodeGroups = (page: Page): Locator => page.locator('.node-group')
// The child list that immediately follows an area's row - that area's subtree.
const areaSubtree = (page: Page, area: string): Locator =>
  legend(page).getByText(area, { exact: true }).locator('xpath=../following-sibling::div[1]')

test('renders the graph header, legend categories, and zoom controls', async ({ page }) => {
  await page.goto('/experience')

  const h1 = page.getByRole('heading', { level: 1 })
  await expect(h1).toContainText('Technology')
  await expect(h1).toContainText('Graph')
  await expect(page.getByText('Active Node:')).toContainText('EXPERIENCE')

  // The D3 graph mounts and draws nodes.
  await expect(nodeGroups(page).first()).toBeVisible()

  // Every area is listed as a category.
  await expect(page.getByText('CATEGORIES', { exact: true })).toBeVisible()
  for (const area of ['Design', 'Web', 'Mobile', 'Desktop', 'Back-end', 'Language'])
    await expect(legend(page).getByText(area, { exact: true })).toBeVisible()

  // Zoom controls.
  await expect(page.getByText('Control_Interface')).toBeVisible()
  for (const label of ['Zoom in', 'Zoom out', 'Reset view'])
    await expect(page.getByRole('button', { name: label })).toBeVisible()
})

test('expanding an area lists its children and draws more graph nodes', async ({ page }) => {
  await page.goto('/experience')
  await expect(nodeGroups(page).first()).toBeVisible()
  const before = await nodeGroups(page).count()

  await legend(page).getByText('Web', { exact: true }).click()

  await expect(areaSubtree(page, 'Web').getByText('React', { exact: true })).toBeVisible()
  await expect.poll(() => nodeGroups(page).count()).toBeGreaterThan(before)
})

test('collapses and re-expands a nested branch in the legend', async ({ page }) => {
  await page.goto('/experience')
  await expect(nodeGroups(page).first()).toBeVisible()
  await legend(page).getByText('Web', { exact: true }).click()
  const web = areaSubtree(page, 'Web')
  const reactRow = web.getByText('React', { exact: true })
  // React's own child list. The collapse is a CSS-grid clip (it hides visually without
  // zeroing layout), so track the open state via the list's data-open flag, not visibility.
  const reactList = reactRow.locator('xpath=../following-sibling::div[1]')

  // React is a featured branch, so opening Web already expanded it (Zustand revealed).
  await expect(reactList).toHaveAttribute('data-open', 'true')
  await expect(web.getByText('Zustand', { exact: true })).toBeVisible()

  // Dispatch the click directly: once scrolled into view the row can sit under the sticky
  // page header, which would intercept a real pointer click.
  await reactRow.dispatchEvent('click') // collapse React
  await expect(reactList).toHaveAttribute('data-open', 'false')

  await reactRow.dispatchEvent('click') // expand React again
  await expect(reactList).toHaveAttribute('data-open', 'true')
})

test('the legacy switch reveals and hides legacy tech in the legend', async ({ page }) => {
  await page.goto('/experience')
  await expect(nodeGroups(page).first()).toBeVisible()
  await legend(page).getByText('Web', { exact: true }).click()

  // jQuery is legacy Web tech - absent from the menu while the switch is off.
  await expect(page.getByText('jQuery', { exact: true })).toHaveCount(0)

  // Scope to the legend - the page header carries its own "Toggle theme" switch.
  const legacySwitch = legend(page).getByRole('switch')
  await legacySwitch.dispatchEvent('click') // Show legacy → on
  await expect(page.getByText('jQuery', { exact: true })).toHaveCount(2)

  await legacySwitch.dispatchEvent('click') // off again
  await expect(page.getByText('jQuery', { exact: true })).toHaveCount(0)
})

test('keeps an area-gated tech under its own area only', async ({ page }) => {
  await page.goto('/experience')
  await expect(nodeGroups(page).first()).toBeVisible()
  // React Native gates to Mobile. Opening Web (React auto-expands) must not list it there.
  await legend(page).getByText('Web', { exact: true }).click()
  await expect(areaSubtree(page, 'Web').getByText('React Native', { exact: true })).toHaveCount(0)

  // Opening Mobile reveals React Native under that area.
  await legend(page).getByText('Mobile', { exact: true }).click()
  await expect(
    areaSubtree(page, 'Mobile').getByText('React Native', { exact: true }).first()
  ).toBeVisible()
})

test('reveals the floating ESBuild node once its area is active', async ({ page }) => {
  await page.goto('/experience')
  await expect(nodeGroups(page).first()).toBeVisible()
  // ESBuild has no parent; it rides along its relation to Vite (a Web node), so it is
  // absent until Web is active.
  await expect(page.getByText('ESBuild', { exact: true })).toHaveCount(0)

  await legend(page).getByText('Web', { exact: true }).click()
  await legend(page).getByText('Vite', { exact: true }).click()
  await expect(page.getByText('ESBuild', { exact: true })).toBeVisible()
})

test('zoom controls stay operable', async ({ page }) => {
  await page.goto('/experience')
  await expect(nodeGroups(page).first()).toBeVisible()
  await page.getByRole('button', { name: 'Zoom in' }).click()
  await page.getByRole('button', { name: 'Zoom out' }).click()
  await page.getByRole('button', { name: 'Reset view' }).click()
  await expect(page.getByRole('button', { name: 'Reset view' })).toBeVisible()
})
