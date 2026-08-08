import type { PageContext } from 'vike/types'
import { SITE_URL } from 'src/config'
import type { HeadMeta, MetaTag } from './head'
import { SITE_NAME, documentTitle, pageDescription } from './seo'

/** Marks tags this module owns, so the client can remove the previous page's set on navigation. */
const MARK = 'data-mh'

/** A managed head tag, rendered to HTML on the server and to a DOM node on the client. */
type HeadTag =
  | { el: 'title'; text: string }
  | { el: 'meta' | 'link'; attrs: Record<string, string> }
  | { el: 'script'; json: object }

/** Escapes a value for safe interpolation into HTML text and attribute contexts. */
const escape = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const isHeadMeta = (data: unknown): data is HeadMeta =>
  typeof data === 'object' && data !== null && ('meta' in data || 'jsonLd' in data)

// `isHeadMeta` only proves `meta` exists, not that each entry is well-formed. Validate the
// shape so a malformed payload is skipped rather than crashing `escape()` during serialization.
const isMetaTag = (value: unknown): value is MetaTag => {
  if (typeof value !== 'object' || value === null) return false
  const tag = value as Record<string, unknown>
  if (typeof tag.content !== 'string') return false
  return typeof tag.name === 'string' || typeof tag.property === 'string'
}

// 'unsafe-inline' styles are required by Emotion's critical-CSS extraction;
// *.githubusercontent.com covers avatars and gist-proxied images.
// challenges.cloudflare.com loads the Turnstile script and renders its challenge
// in an iframe (frame-src â€” otherwise default-src 'self' would block it).
const CSP = [
  "default-src 'self'",
  "script-src 'self' https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https://*.githubusercontent.com data:",
  "connect-src 'self' https://api.github.com https://api.soroush.tech",
  'frame-src https://challenges.cloudflare.com',
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const metaAttrs = (tag: MetaTag): Record<string, string> =>
  'name' in tag
    ? { name: tag.name, content: tag.content }
    : { property: tag.property, content: tag.content }

/**
 * The managed `<head>` tags for a page: the mechanical/required tags (title, canonical, og:url,
 * referrer, robots, og:site_name) plus the page-owned tags from `+data.ts` (`HeadMeta.meta` and
 * `HeadMeta.jsonLd`). CSP is excluded â€” it's a parse-time, server-only concern. This single source
 * of truth feeds both `buildHead` (server HTML) and `applyHead` (client DOM on navigation).
 */
export const collectHeadTags = (pageContext: PageContext): HeadTag[] => {
  const robots =
    typeof pageContext.config?.robots === 'string' ? pageContext.config.robots : 'index,follow'
  // Trailing slash matches GitHub Pages, which 301-redirects `/about` -> `/about/`.
  const path = pageContext.urlPathname || '/'
  const slashedPath = path.endsWith('/') ? path : `${path}/`
  const url = `${SITE_URL}${slashedPath}`
  const head = isHeadMeta(pageContext.data) ? pageContext.data : undefined
  // Canonical description from the page config, resolved the same way as the title
  // (article pages supply it via their +description hook). socialMeta owns og/twitter only.
  const description = pageDescription(pageContext)

  const tags: HeadTag[] = [
    { el: 'title', text: documentTitle(pageContext) },
    { el: 'meta', attrs: { name: 'referrer', content: 'strict-origin-when-cross-origin' } },
    { el: 'link', attrs: { rel: 'canonical', href: url } },
    { el: 'meta', attrs: { property: 'og:url', content: url } },
    { el: 'meta', attrs: { property: 'og:site_name', content: SITE_NAME } },
    { el: 'meta', attrs: { name: 'robots', content: robots } },
  ]
  if (description) tags.push({ el: 'meta', attrs: { name: 'description', content: description } })
  for (const tag of head?.meta ?? [])
    if (isMetaTag(tag)) tags.push({ el: 'meta', attrs: metaAttrs(tag) })
  if (head?.jsonLd) tags.push({ el: 'script', json: head.jsonLd })

  return tags
}

/** Serializes a managed tag to an HTML string with the `data-mh` marker (server-side). */
const serialize = (tag: HeadTag): string => {
  if (tag.el === 'title') return `<title ${MARK}>${escape(tag.text)}</title>`
  if (tag.el === 'script') {
    // < guards against a "</script>" sequence breaking out of the tag.
    const json = JSON.stringify(tag.json).replaceAll('<', String.raw`\u003c`)
    return `<script type="application/ld+json" ${MARK}>${json}</script>`
  }
  const attrs = Object.entries(tag.attrs)
    .map(([key, value]) => `${key}="${escape(value)}"`)
    .join(' ')
  return `<${tag.el} ${attrs} ${MARK} />`
}

/**
 * Builds the per-page `<head>` HTML: the server-only CSP meta (prod) plus the managed tags from
 * `collectHeadTags`, each marked with `data-mh`. Injected by `+onRenderHtml`.
 */
export const buildHead = (pageContext: PageContext): string =>
  [
    // Dev is skipped: Vite/React-refresh inject inline scripts that `script-src 'self'` would block.
    ...(import.meta.env.DEV
      ? []
      : [`<meta http-equiv="Content-Security-Policy" content="${CSP}" />`]),
    ...collectHeadTags(pageContext).map(serialize),
  ].join('\n    ')

/** Creates the DOM node for a managed tag (client-side). DOM APIs escape values natively. */
const createElement = (tag: HeadTag): HTMLElement => {
  if (tag.el === 'title') {
    const el = document.createElement('title')
    el.textContent = tag.text
    return el
  }
  if (tag.el === 'script') {
    const el = document.createElement('script')
    el.setAttribute('type', 'application/ld+json')
    el.textContent = JSON.stringify(tag.json)
    return el
  }
  const el = document.createElement(tag.el)
  for (const [key, value] of Object.entries(tag.attrs)) el.setAttribute(key, value)
  return el
}

/**
 * Syncs the managed `<head>` tags with the current page on client-side navigation: removes the
 * previous page's `[data-mh]` tags, then re-emits this page's set. Keeps `document.title`,
 * description, canonical, og/twitter, robots, and JSON-LD in sync after a client route change.
 */
export const applyHead = (pageContext: PageContext): void => {
  document.head.querySelectorAll(`[${MARK}]`).forEach((el) => el.remove())
  for (const tag of collectHeadTags(pageContext)) {
    const el = createElement(tag)
    el.setAttribute(MARK, '')
    document.head.appendChild(el)
  }
}
