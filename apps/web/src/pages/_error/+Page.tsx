import { useEffect } from 'react'
import { navigate } from 'vike/client/router'
import { Layout } from 'src/common/Layout'
import { NotFound } from 'src/section/NotFound'
import { usePageContext } from 'src/hooks/usePageContext'

// Non-prerendered dynamic routes a cold direct-hit can land on. On the static host GitHub Pages
// serves this page (prerendered as `build/client/404.html`) for any URL with no static file.
const NON_PRERENDERED_ROUTE = /^\/article\/[^/]+\/?$/

// Vike renders this for both unmatched routes (404) and render errors (500). On a cold hard-load
// of a non-prerendered article (e.g. a gist published after the last deploy) the static host
// hands back 404.html; we boot client routing to re-resolve the real URL — running data() in the
// browser via dataIsomorph — so refresh / deep-link renders the article instead of the 404 screen.
function ErrorPage() {
  const { urlPathname, isClientSideNavigation } = usePageContext()

  useEffect(() => {
    // Only bootstrap on the initial cold load; guarding on isClientSideNavigation stops a client
    // re-render landing back here (a genuine 404) from re-firing navigate() in a loop.
    if (!isClientSideNavigation && NON_PRERENDERED_ROUTE.test(urlPathname)) {
      navigate(urlPathname)
    }
  }, [isClientSideNavigation, urlPathname])

  return (
    <Layout>
      <NotFound />
    </Layout>
  )
}

export default ErrorPage
