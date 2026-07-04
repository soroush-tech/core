import { test, expect } from './fixtures'

test('each page declares a self-referential https canonical URL', async ({ request }) => {
  // Canonical tags are SSR-rendered by buildHead on every request, so they exist in
  // both the dev-server runs and the production-build run — no E2E_COVERAGE gate needed.
  const home = await request.get('/')
  expect(home.status()).toBe(200)
  const homeHtml = await home.text()
  expect(homeHtml).toContain('<link rel="canonical" href="https://soroush.tech/" data-mh />')
  // Home maps to the portrait, so it carries an absolute og:image (asset URL differs
  // between the dev-server and prod-build runs, so match the prefix only).
  expect(homeHtml).toMatch(/<meta property="og:image" content="https:\/\/soroush\.tech\//)

  const articles = await request.get('/articles')
  expect(articles.status()).toBe(200)
  expect(await articles.text()).toContain(
    '<link rel="canonical" href="https://soroush.tech/articles/" data-mh />'
  )
})

test('syncs all head meta on client-side navigation (not just the title)', async ({ page }) => {
  await page.goto('/articles')
  // Wait for hydration so Vike's client router intercepts the click (otherwise the anchor
  // does a full document navigation and we'd never exercise the client-side head sync).
  await page.waitForLoadState('networkidle')

  // Baseline: the articles list — a plain page with no article meta or JSON-LD.
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://soroush.tech/articles/'
  )
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website')
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0)

  // Tag the window so we can prove the navigation was client-side (no full document reload).
  await page.evaluate(() => ((window as Window & { __noReload?: boolean }).__noReload = true))

  await page.getByRole('link', { name: 'Mock Article Title' }).click()
  await expect(page).toHaveURL('/article/mock-gist-id/')
  expect(await page.evaluate(() => (window as Window & { __noReload?: boolean }).__noReload)).toBe(
    true
  )

  // The full managed set is re-synced from the destination page — title, description,
  // canonical, og:url, og:type, and the article's JSON-LD that the list never had.
  await expect(page).toHaveTitle('Mock Article Title by Masoud Soroush · SOROUSH.TECH')
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    'Mock Article Title - Masoud Soroush'
  )
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://soroush.tech/article/mock-gist-id/'
  )
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    'content',
    'https://soroush.tech/article/mock-gist-id/'
  )
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article')
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1)

  // Navigating back removes the article-only tags — proving stale tags are cleared, not stacked.
  await page.goBack()
  await expect(page).toHaveURL('/articles')
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://soroush.tech/articles/'
  )
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website')
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0)
})

test('robots.txt is served and points to the sitemap', async ({ request }) => {
  const res = await request.get('/robots.txt')

  expect(res.status()).toBe(200)
  const body = await res.text()
  expect(body).toContain('User-agent: *')
  expect(body).toContain('Sitemap: https://soroush.tech/sitemap.xml')
})

test('sitemap.xml lists indexable pages and omits noindex ones', async ({ request }) => {
  // sitemap.xml is emitted by vite-plugin/sitemap at build time, so it only exists when
  // the e2e server serves the production build (the coverage run). The dev-server runs
  // (firefox/webkit) have no such artifact, so skip there.
  test.skip(process.env.E2E_COVERAGE !== 'true', 'sitemap.xml is a production-build artifact')

  const res = await request.get('/sitemap.xml')

  expect(res.status()).toBe(200)
  const xml = await res.text()
  expect(xml).toContain('<loc>https://soroush.tech/</loc>')
  expect(xml).toContain('<loc>https://soroush.tech/articles/</loc>')
  expect(xml).toContain('<loc>https://soroush.tech/design/system/</loc>')
  // noindex pages must never be listed.
  expect(xml).not.toContain('/projects</loc>')
})
