// Fails when a publishable package has no release-notes file for its current version.
// cd-packages.yml reads packages/<pkg>/release-notes/<version>.md at publish time and refuses
// to release without it; this catches the same gap earlier — at commit (pre-commit hook) and
// in CI — so a version bump can't land on main without its notes. Private packages are skipped
// (they never publish). Run `pnpm check:release-notes`.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const packagesDir = join(repoRoot, 'packages')

const missing = []

for (const entry of readdirSync(packagesDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue
  const manifestPath = join(packagesDir, entry.name, 'package.json')
  if (!existsSync(manifestPath)) continue

  const { private: isPrivate, version } = JSON.parse(readFileSync(manifestPath, 'utf8'))
  if (isPrivate === true) continue

  const notesPath = join(packagesDir, entry.name, 'release-notes', `${version}.md`)
  if (!existsSync(notesPath)) {
    missing.push(`packages/${entry.name}/release-notes/${version}.md (${entry.name}@${version})`)
  }
}

if (missing.length > 0) {
  console.error('Missing release notes for published version(s):')
  for (const item of missing) console.error(`  - ${item}`)
  console.error('\nAdd the file(s) above (see the release-notes skill), then commit.')
  process.exit(1)
}

console.log('Release notes present for every publishable package version.')
