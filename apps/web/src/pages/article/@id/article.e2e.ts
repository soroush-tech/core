import { test, expect } from 'src/test/e2e/fixtures'

// The gist API is mocked by msw (see src/test/mocks/handlers); the gist id is the one
// the mock list prerenders. See vite-plugin/mswServer for the server-side wiring.
test('article page renders the mocked gist and its SEO meta', async ({ page }) => {
  await page.goto('/article/mock-gist-id')

  await expect(page).toHaveTitle('Mock Article Title by Masoud Soroush · SOROUSH.TECH')

  // Header (from the gist description) and the markdown body.
  await expect(page.getByText('Mock Article Title')).toBeVisible()
  await expect(page.getByText('This is mocked article content for e2e tests.')).toBeVisible()

  // Article SEO meta tags.
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article')
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    'Mock Article Title - Masoud Soroush'
  )
  await expect(page.locator('meta[property="article:author"]')).toHaveAttribute(
    'content',
    'Masoud Soroush'
  )
})

// Regression: a gist published after the build has no prerendered page. Client-routing to
// it must resolve data() in the browser (dataIsomorph) instead of fetching a server-rendered
// pageContext that doesn't exist on our static host. We reach it by injecting a link and
// clicking it — Vike intercepts the anchor (event delegation) and navigates client-side,
// the same path the articles list uses. The gist-by-id mock serves any id (see handlers).
test('client-routes to an article that was not prerendered without crashing', async ({ page }) => {
  await page.goto('/articles')

  await page.evaluate(() => {
    const link = document.createElement('a')
    link.href = '/article/published-after-build'
    link.textContent = 'new article'
    document.body.appendChild(link)
    link.click()
  })

  await expect(page).toHaveURL('/article/published-after-build')
  await expect(page.getByText('This is mocked article content for e2e tests.')).toBeVisible()
})

// GitHub Pages fallback: a COLD hard-load (page.goto, not in-app nav) of a non-prerendered
// article. On the static host there is no index.html for it, so GitHub Pages — and `serve` in
// the e2e preview — return the prerendered 404.html (the _error page). Vike must then boot
// client routing, re-resolve the URL, run data() in the browser (dataIsomorph) and render the
// article, instead of leaving the visitor on the 404 screen. Only meaningful against the static
// preview build (E2E_COVERAGE=true → `pnpm build && pnpm preview:e2e`); the dev server SSRs
// every route and would pass this trivially without touching 404.html.
test('hard-loads a non-prerendered article via the 404.html fallback', async ({ page }) => {
  await page.goto('/article/published-after-build')

  await expect(page).toHaveURL('/article/published-after-build')
  await expect(page.getByText('This is mocked article content for e2e tests.')).toBeVisible()
})
