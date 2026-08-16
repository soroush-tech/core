// Two guards on publishable packages, both run by the pre-commit hook and the CI lint job:
//
// 1. Every publishable package must have a release-notes file for its current version.
//    cd-packages.yml reads packages/<pkg>/release-notes/<version>.md at publish time and refuses
//    to release without it; this catches the same gap earlier, so a version bump can't land on
//    main without its notes. The editor is held to the same rule: cd-editor.yml reads
//    apps/editor/release-notes/<version>.md into its GitHub Release the same way.
// 2. A package with *staged changes* must sit ahead of its latest npm-published version - you
//    can't edit a package and forget the bump. Packages with no staged changes are skipped, so
//    resting at the published version is fine, and repeated commits against one unreleased
//    version (e.g. 1.1.0 while 1.0.0 is live) all pass without touching the version again.
//    The editor mirrors this against its own release channel: staged apps/editor changes must
//    sit ahead of the newest *published* GitHub Release (a v* tag only exists once a release
//    is published - drafts carry none).
//
// Private packages are skipped by both (they never publish). Guard 2 needs the network: when the
// registry (or GitHub) is unreachable it warns and passes, so being offline never blocks a commit.
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

/**
 * The incoming commits of a merge in progress: MERGE_HEAD sits in .git from
 * `git merge` until its commit, one sha per line - several for an octopus
 * merge. Read from disk rather than asked of git - one less process, and the
 * path is fixed for a regular checkout, which this repo's workflow is.
 * Empty outside a merge.
 */
const mergeHeadShas = () => {
  const marker = join(repoRoot, '.git', 'MERGE_HEAD')
  if (!existsSync(marker)) return []
  return readFileSync(marker, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

/**
 * Staged file paths differing from `base` - HEAD when omitted.
 * Empty when nothing is staged (e.g. in CI).
 */
const stagedFiles = (base) =>
  execFileSync('git', ['diff', '--cached', '--name-only', ...(base ? [base] : [])], {
    cwd: repoRoot,
    encoding: 'utf8',
  }).split('\n')

/** Package dirs whose staged content differs from `base`. */
const stagedPackageDirs = (base) => {
  const dirs = new Set()
  for (const file of stagedFiles(base)) {
    // Truthiness, not `!== undefined`: the capture group is `[^/]+`, so a match
    // is always a non-empty string and a miss is always undefined.
    const [, dir] = /^packages\/([^/]+)\//.exec(file) ?? []
    if (dir) dirs.add(dir)
  }
  return dirs
}

/** True when apps/editor content differs from `base` in the stage. */
const editorIsStaged = (base) => stagedFiles(base).some((file) => file.startsWith('apps/editor/'))

/**
 * Compares two semver core versions. Returns a positive number when `a` is newer, 0 when equal.
 * Prereleases are compared by their core only - enough for a "did you bump?" guard, and it never
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

/**
 * The editor's latest released version - the newest *published* v* GitHub Release, asked of the
 * Releases API rather than the tag refs: a stray tag with no release, or one sitting under a
 * draft, is not a published baseline. `null` when no release exists yet, `undefined` when
 * GitHub was unreachable.
 */
const latestEditorRelease = async () => {
  try {
    const response = await fetch(
      'https://api.github.com/repos/soroush-tech/core/releases?per_page=100',
      { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }
    )
    if (!response.ok) return undefined
    const versions = (await response.json())
      .filter(({ draft }) => draft === false)
      .map(({ tag_name: tagName }) => /^v(\d+\.\d+\.\d+)$/.exec(tagName)?.[1])
      .filter(Boolean)
    if (versions.length === 0) return null
    return versions.sort(compareVersions).at(-1)
  } catch {
    return undefined
  }
}

const packages = publishablePackages()

// ─── Guard 1: notes file exists for the current version ───────────────────────

// The editor releases through cd-editor.yml rather than npm, but its GitHub
// Release reads the same kind of file - hold it to the same guard.
const editor = JSON.parse(readFileSync(join(repoRoot, 'apps', 'editor', 'package.json'), 'utf8'))

const missingNotes = packages
  .map(({ dir, name, version }) => ({
    name: `${name}@${version}`,
    file: `packages/${dir}/release-notes/${version}.md`,
  }))
  .concat({
    name: `${editor.name} v${editor.version}`,
    file: `apps/editor/release-notes/${editor.version}.md`,
  })
  .filter(({ file }) => !existsSync(join(repoRoot, file)))

if (missingNotes.length > 0) {
  console.error('Missing release notes for published version(s):')
  for (const { name, file } of missingNotes) {
    console.error(`  - ${file} (${name})`)
  }
  console.error('\nAdd the file(s) above (see the release-notes skill), then commit.')
  process.exit(1)
}

console.log('Release notes present for every publishable package version and the editor.')

// ─── Guard 2: staged packages sit ahead of npm ────────────────────────────────

// A merge stages the whole incoming branch, so a package released there looks
// edited-without-a-bump here. Content that matches any parent already passed
// this guard on its own branch; only a package differing from HEAD and from
// every incoming parent - an edit made during conflict resolution - is new to
// this commit, and that one stays checked.
const mergeHeads = mergeHeadShas()
let staged = stagedPackageDirs()
let editorStaged = editorIsStaged()
if (mergeHeads.length > 0) {
  for (const parent of mergeHeads) {
    const vsParent = stagedPackageDirs(parent)
    staged = new Set([...staged].filter((dir) => vsParent.has(dir)))
  }
  editorStaged = editorStaged && mergeHeads.every((parent) => editorIsStaged(parent))
  console.log('Merge in progress - checking only changes that match no parent.')
}

const changed = packages.filter(({ dir }) => staged.has(dir))

if (changed.length === 0 && !editorStaged) {
  console.log('No staged package or editor changes - skipping the published-version check.')
  process.exit(0)
}

const results = await Promise.all(
  changed.map(async (pkg) => ({ ...pkg, published: await latestPublishedVersion(pkg.name) }))
)

const unreachable = results.filter(({ published }) => published === undefined)
for (const { name } of unreachable) {
  console.warn(`Warning: could not reach the registry for ${name} - version check skipped.`)
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
      'A package you did not change can stay at its published version - only staged ones are checked.'
  )
  process.exit(1)
}

for (const { name, version, published } of results) {
  if (published === undefined) continue
  const live = published === null ? 'unpublished' : published
  console.log(`${name}: ${version} is ahead of npm (${live}).`)
}

// The editor's published versions live in GitHub Releases, not on npm - same
// "did you bump?" rule, different registry.
if (editorStaged) {
  const published = await latestEditorRelease()
  if (published === undefined) {
    console.warn('Warning: could not reach GitHub for the editor - version check skipped.')
  } else if (published !== null && compareVersions(editor.version, published) <= 0) {
    console.error('\nStaged editor is not ahead of the version already released on GitHub:')
    console.error(
      `  - ${editor.name}: apps/editor/package.json is ${editor.version}, GitHub has v${published}`
    )
    console.error(
      '\nBump the version and add its release-notes file (see the release-notes skill).'
    )
    process.exit(1)
  } else {
    const live = published === null ? 'unreleased' : `v${published}`
    console.log(`${editor.name}: ${editor.version} is ahead of GitHub Releases (${live}).`)
  }
}
