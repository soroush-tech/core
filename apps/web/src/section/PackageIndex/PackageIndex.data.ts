export interface PackageEntry {
  /** Full scoped package name (from package.json `name`). */
  name: string
  /** One-line summary (from package.json `description`). */
  description: string
  /** npm version (from package.json `version`). */
  version: string
  /** npm keywords, shown as tags (from package.json `keywords`). */
  keywords: string[]
  /** Where the card links: the internal detail route, or the npm page when no detail page exists. */
  href: string
  /** `'_blank'` when `href` is the external npm page, so the link opens in a new tab. */
  target?: '_blank'
}

export type PackageCardProps = PackageEntry

/** The package.json fields the index card needs. */
interface PackageJson {
  name: string
  description: string
  version: string
  keywords: string[]
  private?: boolean
}

/**
 * Builds a card entry from a package.json. Links to the internal detail page when one exists
 * (`hasPage`), otherwise to the package's npm page (opened in a new tab).
 */
export const toEntry = (pkg: PackageJson, hasPage: boolean): PackageEntry => {
  const slug = pkg.name.split('/')[1]
  return {
    name: pkg.name,
    description: pkg.description,
    version: pkg.version,
    keywords: pkg.keywords,
    href: hasPage ? `/${slug}/` : `https://www.npmjs.com/package/${pkg.name}`,
    target: hasPage ? undefined : '_blank',
  }
}

// Auto-discover every workspace package's package.json (eager → bundled at build time) and the set
// of package detail pages that exist. Only published (non-private) packages are listed; each links
// to its detail page when one exists under src/pages/<slug>/, otherwise to its npm page.
const packageJsons = import.meta.glob<PackageJson>('../../../../../packages/*/package.json', {
  eager: true,
  import: 'default',
})

const pagedSlugs = new Set(
  Object.keys(import.meta.glob('/src/pages/*/+Page.tsx')).map((path) => path.split('/')[3])
)

/** Published `@soroush.tech/*` packages, discovered from the workspace and sorted by name. */
export const packages: PackageEntry[] = Object.values(packageJsons)
  .filter((pkg) => !pkg.private)
  .map((pkg) => toEntry(pkg, pagedSlugs.has(pkg.name.split('/')[1])))
  .sort((a, b) => a.name.localeCompare(b.name))
