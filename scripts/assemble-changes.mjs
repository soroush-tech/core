// What CI considers changed, in one place. `ci.yml`'s prepare job calls this twice:
//
//   node scripts/assemble-changes.mjs filters   >> "$GITHUB_OUTPUT"
//   node scripts/assemble-changes.mjs assemble  >> "$GITHUB_OUTPUT"
//
// `filters` prints the per-entity paths-filter config; `assemble` reads the keys that matched
// and decides which jobs run, writing changes.json for the CD workflows on the way.
//
// A root file used to mean "everything changed", so adding one dependency to one package ran
// the whole matrix — a lockfile is written by every dependency change. Each root file is now
// asked what it actually affects; only `pnpm-lock.yaml` and the root `package.json` need their
// previous version to answer, and both fall back to the whole workspace when it cannot be read.
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * Root files, each its own filter key so the change can be attributed. The three under
 * `WHOLE_WORKSPACE` change how everything installs or builds; the other two are read.
 */
const ROOT_FILES = {
  root__workspace: 'pnpm-workspace.yaml',
  root__nvmrc: '.nvmrc',
  root__tsconfig: 'tsconfig.json',
  root__package: 'package.json',
  root__lock: 'pnpm-lock.yaml',
}

const WHOLE_WORKSPACE = ['root__workspace', 'root__nvmrc', 'root__tsconfig']

/** Where a workspace member lives, and the filter-key prefix it answers to. */
const AREAS = [
  { dir: 'apps', prefix: 'app__' },
  { dir: 'workers', prefix: 'worker__' },
  { dir: 'packages', prefix: 'pkg__' },
]

const dirsWithPackageJson = (root) => {
  const path = join(repoRoot, root)
  if (!existsSync(path)) return []
  return readdirSync(path, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(path, entry.name, 'package.json')))
    .map((entry) => entry.name)
}

/**
 * The paths-filter config: one key per workspace member, per workflow file, and per root file.
 * JSON is valid YAML, so the action takes this as its `filters` input verbatim.
 */
export function buildFilters() {
  const filters = {}
  for (const { dir, prefix } of AREAS) {
    for (const name of dirsWithPackageJson(dir)) filters[`${prefix}${name}`] = [`${dir}/${name}/**`]
  }
  for (const file of readdirSync(join(repoRoot, '.github/workflows'))) {
    if (/\.ya?ml$/.test(file)) {
      filters[`wf__${file.replace(/\.ya?ml$/, '')}`] = [`.github/workflows/${file}`]
    }
  }
  for (const [key, file] of Object.entries(ROOT_FILES)) filters[key] = [file]
  return filters
}

/**
 * The importer blocks of a pnpm lockfile, keyed by workspace path. Sectioned by indentation
 * rather than parsed: prepare runs before any install, so there is no YAML parser to reach for,
 * and pnpm writes this file itself — the shape is machine-stable.
 *
 * Structural, because a changed importer's inner lines carry no key of their own: a diff hunk
 * cannot say whose dependency moved, but the block it sits in can.
 */
export function readImporters(lockfile) {
  const importers = new Map()
  let current = null
  let inImporters = false

  for (const line of lockfile.split('\n')) {
    if (/^\S/.test(line)) {
      // Back at the top level: `importers:` has ended, and so has any block inside it.
      inImporters = line.startsWith('importers:')
      current = null
      continue
    }
    if (!inImporters) continue

    const [, key] = /^ {2}(\S.*?):\s*$/.exec(line) ?? []
    if (key !== undefined) {
      current = key.replace(/^['"]|['"]$/g, '')
      importers.set(current, [])
      continue
    }
    if (current !== null) importers.get(current).push(line)
  }

  return new Map([...importers].map(([key, lines]) => [key, lines.join('\n')]))
}

/** The filter key a lockfile importer belongs to, or null when it is not a workspace member. */
function toFilterKey(importer) {
  for (const { dir, prefix } of AREAS) {
    const [, name] = new RegExp(`^${dir}/([^/]+)$`).exec(importer) ?? []
    if (name !== undefined) return `${prefix}${name}`
  }
  return null
}

/**
 * Which members a lockfile change belongs to. Null means the whole workspace: the root importer
 * carries the tooling everything is built with, and a change that moves no importer at all is a
 * transitive one — who inherits it cannot be told without resolving the graph, so everything runs.
 */
export function attributeLockfile(base, head) {
  const before = readImporters(base)
  const after = readImporters(head)
  const moved = [...new Set([...before.keys(), ...after.keys()])].filter(
    (key) => before.get(key) !== after.get(key)
  )

  if (moved.length === 0 || moved.includes('.')) return null
  const keys = moved.map(toFilterKey)
  // An importer outside apps/workers/packages is a member CI does not know how to run on its own.
  return keys.includes(null) ? null : keys
}

/** True when the root manifest changed anywhere but `scripts` — the part that shapes the install. */
export function packageJsonMattersBeyondScripts(base, head) {
  const withoutScripts = (json) => {
    const { scripts: _scripts, ...rest } = JSON.parse(json)
    return JSON.stringify(rest)
  }
  return withoutScripts(base) !== withoutScripts(head)
}

/**
 * What ran, from what changed. Pure: `changed` is the paths-filter result, `attributed` is what
 * the root files were found to mean (extra filter keys, or `wholeWorkspace`).
 */
export function assembleChanges({ changed, allPackages, attributed = [], wholeWorkspace = false }) {
  const keys = new Set([...changed, ...attributed])
  const pick = (prefix) =>
    [...keys].filter((key) => key.startsWith(prefix)).map((key) => key.slice(prefix.length))

  const apps = pick('app__')
  const worker = pick('worker__')
  const packages = pick('pkg__')
  const workflows = pick('wf__')

  // A workflow change re-validates everything for the same reason a root file does: it changes
  // how every job runs, and the run proving that is this one.
  const infra = wholeWorkspace || workflows.length > 0
  const pkgsForCI = infra ? allPackages : packages

  return {
    changes: { apps, worker, packages, workflows, root: wholeWorkspace },
    outputs: {
      web: apps.includes('web') || packages.length > 0 || infra,
      worker:
        worker.includes('api') ||
        packages.includes('schema') ||
        packages.includes('wrangler-tools') ||
        infra,
      worker_bench: worker.includes('bench') || packages.includes('wrangler-tools') || infra,
      has_packages: pkgsForCI.length > 0,
      // `browsers` marks a package with a real-browser vitest tier — it declares `playwright`
      // itself, and its CI row has to install Chromium first.
      changed_packages: {
        include: pkgsForCI.map((dir) => {
          const pkg = JSON.parse(
            readFileSync(join(repoRoot, 'packages', dir, 'package.json'), 'utf8')
          )
          const browsers = Boolean(
            pkg.devDependencies?.playwright ?? pkg.dependencies?.playwright ?? false
          )
          return { dir, filter: pkg.name, flag: dir, browsers }
        }),
      },
    },
  }
}

/** A file as it was at `baseSha`, or null when that commit is not here to be read. */
function fileAtBase(baseSha, file) {
  try {
    return execFileSync('git', ['show', `${baseSha}:${file}`], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
  } catch {
    return null
  }
}

/** Makes sure the base commit is in a shallow clone, so it can be read without fetching history. */
function fetchBase(baseSha) {
  // All zeros is what a push event carries for a branch that had no previous commit.
  if (!baseSha || /^0+$/.test(baseSha)) return false
  try {
    execFileSync('git', ['cat-file', '-e', `${baseSha}^{commit}`], {
      cwd: repoRoot,
      stdio: 'ignore',
    })
    return true
  } catch {
    /* Not in the shallow clone yet — ask for that one commit. */
  }
  try {
    execFileSync('git', ['fetch', '--no-tags', '--depth=1', 'origin', baseSha], {
      cwd: repoRoot,
      stdio: 'ignore',
    })
    return true
  } catch {
    return false
  }
}

/**
 * Reads the root files that changed and reports what they mean. Anything that cannot be compared
 * against its previous version counts as the whole workspace — the safe answer is the slow one.
 */
export function attributeRootFiles(changed, baseSha, read = (file) => fileAtBase(baseSha, file)) {
  const touched = Object.keys(ROOT_FILES).filter((key) => changed.includes(key))
  if (touched.length === 0) return { attributed: [], wholeWorkspace: false, reasons: [] }

  const reasons = []
  const attributed = []
  let wholeWorkspace = false

  for (const key of touched.filter((key) => WHOLE_WORKSPACE.includes(key))) {
    wholeWorkspace = true
    reasons.push(`${ROOT_FILES[key]} changed — it shapes the whole workspace`)
  }

  const compare = (key, decide) => {
    if (!touched.includes(key)) return
    const file = ROOT_FILES[key]
    const base = read(file)
    if (base === null) {
      wholeWorkspace = true
      return reasons.push(`${file} changed and its previous version could not be read`)
    }
    decide(base, readFileSync(join(repoRoot, file), 'utf8'), file)
  }

  compare('root__package', (base, head, file) => {
    if (!packageJsonMattersBeyondScripts(base, head)) {
      return reasons.push(`${file} changed in scripts only`)
    }
    wholeWorkspace = true
    reasons.push(`${file} changed beyond scripts`)
  })

  compare('root__lock', (base, head, file) => {
    const keys = attributeLockfile(base, head)
    if (keys === null) {
      wholeWorkspace = true
      return reasons.push(`${file} changed outside any one importer`)
    }
    attributed.push(...keys)
    reasons.push(`${file} moved ${keys.join(', ')}`)
  })

  return { attributed, wholeWorkspace, reasons }
}

function main() {
  const [mode] = process.argv.slice(2)

  if (mode === 'filters') {
    console.log(`filters=${JSON.stringify(buildFilters())}`)
    return
  }

  if (mode !== 'assemble') {
    console.error('Usage: assemble-changes.mjs filters|assemble')
    process.exit(1)
  }

  const changed = JSON.parse(process.env.CHANGES ?? '[]')
  const allPackages = dirsWithPackageJson('packages')
  const baseSha = process.env.BASE_SHA ?? ''

  const { attributed, wholeWorkspace, reasons } = attributeRootFiles(
    changed,
    fetchBase(baseSha) ? baseSha : null
  )
  for (const reason of reasons) console.error(`changes: ${reason}`)

  const { changes, outputs } = assembleChanges({
    changed,
    allPackages,
    attributed,
    wholeWorkspace,
  })

  writeFileSync(join(repoRoot, 'changes.json'), JSON.stringify(changes))
  for (const [key, value] of Object.entries(outputs)) {
    console.log(`${key}=${typeof value === 'object' ? JSON.stringify(value) : value}`)
  }
}

// Importing this file for its pure parts must not run the CLI.
if (process.argv[1] === fileURLToPath(import.meta.url)) main()
