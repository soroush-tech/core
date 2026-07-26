// Two guards on publishable packages, both run by the pre-commit hook and the CI lint job:
//
// 1. Every publishable package must have a release-notes file for its current version.
//    cd-packages.yml reads packages/<pkg>/release-notes/<version>.md at publish time and refuses
//    to release without it; this catches the same gap earlier, so a version bump can't land on
//    main without its notes.
// 2. A package with *staged changes* must sit ahead of its latest npm-published version — you
//    can't edit a package and forget the bump. Packages with no staged changes are skipped, so
//    resting at the published version is fine, and repeated commits against one unreleased
//    version (e.g. 1.1.0 while 1.0.0 is live) all pass without touching the version again.
//
// Private packages are skipped by both (they never publish). Guard 2 needs the network: when the
// registry is unreachable it warns and passes, so being offline never blocks a commit.
// Run `pnpm check:release-notes`.
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const packagesDir = join(repoRoot, 'packages')
const REGISTRY = 'https://registry.npmjs.org'
const FETCH_TIMEOUT_MS = 5000

/** Publishable packages as { dir, name, version }. */
const publishablePackages = () =>
  readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({ dir: entry.name, manifest: join(packagesDir, entry.name, 'package.json') }))
    .filter(({ manifest }) => existsSync(manifest))
    .map(({ dir, manifest }) => ({ dir, ...JSON.parse(readFileSync(manifest, 'utf8')) }))
    .filter(({ private: isPrivate }) => isPrivate !== true)
    .map(({ dir, name, version }) => ({ dir, name, version }))

/** Package dirs touched by the staged diff. Empty when nothing is staged (e.g. in CI). */
const stagedPackageDirs = () => {
  const output = execFileSync('git', ['diff', '--cached', '--name-only'], {
    cwd: repoRoot,
    encoding: 'utf8',
  })
  const dirs = new Set()
  for (const file of output.split('\n')) {
    const [, dir] = /^packages\/([^/]+)\//.exec(file) ?? []
    if (dir !== undefined) dirs.add(dir)
  }
  return dirs
}

/**
 * Compares two semver core versions. Returns a positive number when `a` is newer, 0 when equal.
 * Prereleases are compared by their core only — enough for a "did you bump?" guard, and it never
 * reports a prerelease as newer than the release it precedes.
 */
const compareVersions = (a, b) => {
  const core = (v) => v.split('-')[0].split('.').map(Number)
  const [aParts, bParts] = [core(a), core(b)]
  for (let i = 0; i < 3; i += 1) {
    if (aParts[i] !== bParts[i]) return aParts[i] - bParts[i]
  }
  return 0
}

/** Latest published version, `null` when never published, `undefined` when the registry failed. */
const latestPublishedVersion = async (name) => {
  try {
    const response = await fetch(`${REGISTRY}/${name}/latest`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    if (response.status === 404) return null
    if (!response.ok) return undefined
    return (await response.json()).version
  } catch {
    return undefined
  }
}

const packages = publishablePackages()

// ─── Guard 1: notes file exists for the current version ───────────────────────

const missingNotes = packages.filter(
  ({ dir, version }) => !existsSync(join(packagesDir, dir, 'release-notes', `${version}.md`))
)

if (missingNotes.length > 0) {
  console.error('Missing release notes for published version(s):')
  for (const { dir, name, version } of missingNotes) {
    console.error(`  - packages/${dir}/release-notes/${version}.md (${name}@${version})`)
  }
  console.error('\nAdd the file(s) above (see the release-notes skill), then commit.')
  process.exit(1)
}

console.log('Release notes present for every publishable package version.')

// ─── Guard 2: staged packages sit ahead of npm ────────────────────────────────

const staged = stagedPackageDirs()
const changed = packages.filter(({ dir }) => staged.has(dir))

if (changed.length === 0) {
  console.log('No staged package changes — skipping the published-version check.')
  process.exit(0)
}

const results = await Promise.all(
  changed.map(async (pkg) => ({ ...pkg, published: await latestPublishedVersion(pkg.name) }))
)

const unreachable = results.filter(({ published }) => published === undefined)
for (const { name } of unreachable) {
  console.warn(`Warning: could not reach the registry for ${name} — version check skipped.`)
}

const stale = results.filter(
  ({ version, published }) =>
    published !== undefined && published !== null && compareVersions(version, published) <= 0
)

if (stale.length > 0) {
  console.error('\nStaged package(s) are not ahead of the version already on npm:')
  for (const { dir, name, version, published } of stale) {
    console.error(`  - ${name}: packages/${dir}/package.json is ${version}, npm has ${published}`)
  }
  console.error(
    '\nBump the version and add its release-notes file (see the release-notes skill).\n' +
      'A package you did not change can stay at its published version — only staged ones are checked.'
  )
  process.exit(1)
}

for (const { name, version, published } of results) {
  if (published === undefined) continue
  const live = published === null ? 'unpublished' : published
  console.log(`${name}: ${version} is ahead of npm (${live}).`)
}
