import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve, sep } from 'node:path'
import type { Plugin } from 'vite'

const SITE_URL = process.env.VITE_SITE_URL ?? 'https://soroush.tech'

const meta = (html: string, name: string): string | undefined => {
  // Match name= or property= regardless of attribute order around content=.
  const pattern = new RegExp(
    `<meta[^>]*(?:name|property)="${name}"[^>]*content="([^"]*)"|<meta[^>]*content="([^"]*)"[^>]*(?:name|property)="${name}"`,
    'i'
  )
  const match = pattern.exec(html)
  return match ? (match[1] ?? match[2]) : undefined
}

// `about/index.html` -> `/about/`, `index.html` -> `/`, `article/x/index.html` -> `/article/x/`.
// Trailing slashes match static hosts that 301-redirect `/about` -> `/about/`.
const toPath = (relative: string): string =>
  `/${relative
    .split(sep)
    .join('/')
    .replace(/index\.html$/, '')}`

const generate = (clientDir: string): number => {
  const entries = readdirSync(clientDir, { recursive: true })
    .map(String)
    .filter((entry) => entry.endsWith('.html'))
    .map((relative) => ({ relative, html: readFileSync(resolve(clientDir, relative), 'utf8') }))
    .filter(({ html }) => !meta(html, 'robots')?.includes('noindex'))
    .map(({ relative, html }) => ({
      loc: SITE_URL + toPath(relative),
      lastmod: meta(html, 'article:modified_time')?.slice(0, 10),
    }))
    .sort((a, b) => a.loc.localeCompare(b.loc))

  if (!entries.length) return 0

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(({ loc, lastmod }) => {
      const mod = lastmod ? `<lastmod>${lastmod}</lastmod>` : ''
      return `  <url><loc>${loc}</loc>${mod}</url>`
    }),
    '</urlset>',
    '',
  ].join('\n')

  writeFileSync(resolve(clientDir, 'sitemap.xml'), xml)
  return entries.length
}

/**
 * Emits `sitemap.xml` from Vike's prerendered output. Runs after the bundle closes
 * (`order: 'post'`, once prerendering has written `build/client/**\/*.html`) and scans
 * the same HTML that gets deployed, so the sitemap matches the live pages. A page is
 * skipped when its `<meta name="robots">` contains `noindex`, with no hardcoded list to
 * maintain. The empty scan that precedes prerender (e.g. the client-build pass) writes
 * nothing.
 */
export interface SitemapOptions {
  /**
   * Emit the sitemap only when `true`; otherwise the plugin is an inert no-op. Disable it for
   * builds that reuse the app's Vite config but emit no `build/client` SSG output for the plugin
   * to scan — e.g. a Storybook build (`NODE_ENV=storybook`). Default: `true`.
   */
  enable?: boolean
}

export default function sitemap({ enable = true }: SitemapOptions = {}): Plugin {
  if (!enable) return { name: 'vite-plugin-sitemap' }

  let clientDir = ''
  return {
    name: 'vite-plugin-sitemap',
    apply: 'build',
    configResolved({ root }) {
      clientDir = resolve(root, 'build/client')
    },
    closeBundle: {
      order: 'post',
      handler() {
        const count = generate(clientDir)
        if (count) console.log(`✓ sitemap: wrote ${count} URLs to build/client/sitemap.xml`)
      },
    },
  }
}
