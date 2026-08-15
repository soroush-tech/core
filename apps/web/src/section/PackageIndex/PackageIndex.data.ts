import oxfmtQuick from 'oxfmt-quick/package.json'

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
 * The route segment for a package: its name without the scope. Unscoped names (packages
 * published outside the `@soroush.tech` scope) have no scope to strip.
 */
export const slugOf = (name: string): string => name.slice(name.lastIndexOf('/') + 1)

/**
 * Builds a card entry from a package.json. Links to the internal detail page when one exists
 * (`hasPage`), otherwise to the package's npm page (opened in a new tab).
 */
export const toEntry = (pkg: PackageJson, hasPage: boolean): PackageEntry => {
  const slug = slugOf(pkg.name)
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

/**
 * Packages published from their own repository rather than from `packages/`, so the glob above
 * cannot find them. Their metadata is read from the installed package rather than restated here,
 * so the card cannot drift from what was published — the version shown is the one this site is
 * built against, which moves when the dependency is bumped.
 */
const external: PackageJson[] = [oxfmtQuick]

/** Published packages, discovered from the workspace and the list above, sorted by name. */
export const packages: PackageEntry[] = [...Object.values(packageJsons), ...external]
  .filter((pkg) => !pkg.private)
  .map((pkg) => toEntry(pkg, pagedSlugs.has(slugOf(pkg.name))))
  .sort((a, b) => a.name.localeCompare(b.name))
