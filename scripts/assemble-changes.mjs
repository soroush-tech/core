// What CI considers changed, in one place. `ci.yml`'s prepare job calls this twice:
//
//   node scripts/assemble-changes.mjs filters   >> "$GITHUB_OUTPUT"
//   node scripts/assemble-changes.mjs assemble  >> "$GITHUB_OUTPUT"
//
// `filters` prints the per-entity paths-filter config; `assemble` reads the keys that matched
// and decides which jobs run, writing changes.json for the CD workflows on the way.
//
// A root file used to mean "everything changed", so adding one dependency to one package ran
// the whole matrix - a lockfile is written by every dependency change. Each root file is now
// asked what it actually affects; only `pnpm-lock.yaml` and the root `package.json` need their
// previous version to answer, and both fall back to the whole workspace when it cannot be read.
//
// Those previous versions arrive as files, laid out by the workflow step before this one and
// named by BASE_PACKAGE_JSON and BASE_LOCKFILE. Reading them is `git`'s job, deciding what they
// mean is this file's, and nothing here shells out.
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

const WHOLE_WORKSPACE = new Set(['root__workspace', 'root__nvmrc', 'root__tsconfig'])

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
 * Every CI definition file that carries a `# ci:validates` marker, by the name its `wf__` filter
 * key uses. The workflows are discovered; the composite setup action is named, being the one such
 * file outside `.github/workflows/`. It belongs here rather than in `ROOT_FILES`: every job
 * installs through it, so editing it must re-run all of them - but it is a CI file, and a root
 * file additionally sets `changes.root`, which is what the CD workflows deploy on.
 */
export function ciFiles() {
  const files = {}
  for (const file of readdirSync(join(repoRoot, '.github/workflows'))) {
    if (/\.ya?ml$/.test(file)) files[file.replace(/\.ya?ml$/, '')] = `.github/workflows/${file}`
  }
  files['actions-setup'] = '.github/actions/setup/action.yml'
  return files
}

/**
 * One key over every CI definition path, whose matched **paths** - not just the key - come back
 * to `assemble` via `list-files: json`, to catch a file that `ciFiles()` cannot see - see
 * `unclaimedCiPaths`.
 */
const CI_ANY = 'ci__any'

/**
 * Matches only when a CI definition file was **deleted** - a paths-filter status predicate over
 * the same two globs as `CI_ANY`, firing on the deletion itself no matter what else changed
 * alongside it. A deleted path also surfaces through `unclaimedCiPaths`, but that rests on the
 * file list arriving intact; this fires from the filter match alone, so the deletion case never
 * hangs on one mechanism.
 */
const CI_DELETED = 'ci__deleted'

/**
 * The paths-filter config: one key per workspace member, per CI definition file, and per root
 * file, plus the two catch-alls. JSON is valid YAML, so the action takes this as its `filters`
 * input verbatim.
 */
export function buildFilters() {
  const filters = {}
  for (const { dir, prefix } of AREAS) {
    for (const name of dirsWithPackageJson(dir)) filters[`${prefix}${name}`] = [`${dir}/${name}/**`]
  }
  for (const [name, file] of Object.entries(ciFiles())) filters[`wf__${name}`] = [file]
  filters[CI_ANY] = ['.github/workflows/**', '.github/actions/**']
  filters[CI_DELETED] = [{ deleted: '.github/workflows/**' }, { deleted: '.github/actions/**' }]
  for (const [key, file] of Object.entries(ROOT_FILES)) filters[key] = [file]
  return filters
}

/**
 * The changed CI paths that no per-file key claims: `ci__any`'s matches, minus `ciFiles()` and
 * minus the `.md` companions, which are documentation no job reads. Anything left is a CI file
 * the attribution cannot see - a deleted workflow (the keys are built from the working tree), an
 * aux file inside an action - and the caller validates everything for it: the same answer an
 * unreadable marker gets, for the same reason: this must over-run, never quietly under-run.
 *
 * Paths rather than keys, because keys cannot say this. A deletion or an unkeyed file beside an
 * ordinary edit produces the same matched keys as the edit alone, so any key heuristic goes blind
 * past the first claim - while the edit's claim can be far narrower than what the masked file
 * validated. `null` means `ci__any` matched but the file list itself is missing: nothing can be
 * ruled out, and the caller treats it as "everything" too.
 */
export function unclaimedCiPaths(changed, files) {
  if (!changed.includes(CI_ANY)) return []
  if (files === null) return null
  const claimed = new Set(Object.values(ciFiles()))
  return files.filter((path) => !claimed.has(path) && !path.endsWith('.md'))
}

/**
 * The importer blocks of a pnpm lockfile, keyed by workspace path. Sectioned by indentation
 * rather than parsed: prepare runs before any install, so there is no YAML parser to reach for,
 * and pnpm writes this file itself - the shape is machine-stable.
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

    // Truthiness, not `!== undefined`: the capture group starts with `\S`, so a match is always
    // a non-empty string and a miss is always undefined.
    const [, key] = /^ {2}(\S.*?):\s*$/.exec(line) ?? []
    if (key) {
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
    // Truthiness again: `[^/]+` cannot match an empty name.
    const [, name] = new RegExp(`^${dir}/([^/]+)$`).exec(importer) ?? []
    if (name) return `${prefix}${name}`
  }
  return null
}

/**
 * Which members a lockfile change belongs to. Null means the whole workspace: the root importer
 * carries the tooling everything is built with, and a change that moves no importer at all is a
 * transitive one - who inherits it cannot be told without resolving the graph, so everything runs.
 */
export function attributeLockfile(base, head) {
  const before = readImporters(base)
  const after = readImporters(head)
  const moved = [...new Set([...before.keys(), ...after.keys()])].filter(
    (key) => before.get(key) !== after.get(key)
  )

  if (moved.length === 0 || moved.includes('.')) return null
  // `labs/*` is a bench experiment: no lint, no tests, no job. A dependency of its own asks for
  // nothing here, rather than for the whole workspace because nothing knows what to do with it.
  const keys = moved.filter((importer) => !importer.startsWith('labs/')).map(toFilterKey)
  // An importer outside those areas is a member CI does not know how to run on its own.
  return keys.includes(null) ? null : keys
}

/** True when the root manifest changed anywhere but `scripts` - the part that shapes the install. */
export function packageJsonMattersBeyondScripts(base, head) {
  const withoutScripts = (json) => {
    const manifest = JSON.parse(json)
    delete manifest.scripts
    return JSON.stringify(manifest)
  }
  return withoutScripts(base) !== withoutScripts(head)
}

/**
 * What a changed workflow file asks to be re-validated, from the `# ci:validates` marker it
 * carries. A workflow says this about itself rather than being looked up in a table kept
 * elsewhere: the scope belongs beside the jobs it describes, so moving a job means editing the
 * file whose marker would have to change anyway.
 *
 *   # ci:validates all           → the whole workspace (`ci.yml`: it decides how every job runs)
 *   # ci:validates nothing       → nothing (a deploy, Chromatic, the labeller: CI never runs them)
 *   # ci:validates app__web      → those filter keys
 *
 * The prefix is exact - `# ci:validates ` and then the tokens. A file that spells it any other
 * way is unmarked as far as this is concerned, and an unmarked workflow means the whole
 * workspace: a new file, or a mistyped marker, can only ever over-run.
 */
/** How a workflow opens its scope. Exactly this, then the tokens - see the doc block above. */
const MARKER = '# ci:validates '

export function workflowValidates(name) {
  let source
  try {
    // Deleted files are gone from `ciFiles()`, so fall back to where a workflow would have been:
    // the read then fails, which is the answer either way.
    source = readFileSync(
      join(repoRoot, ciFiles()[name] ?? `.github/workflows/${name}.yml`),
      'utf8'
    )
  } catch {
    // Deleted in this very change: there is nothing left to read, so nothing is claimed.
    return { keys: [], wholeWorkspace: false }
  }

  // Found by looking at each line rather than by pattern: the marker is a fixed prefix at the
  // start of a line, which is a thing to compare, not to search for. A regular expression asked
  // to find it has to consider every place it might begin, and pays for that on every workflow
  // that carries no marker at all - which is most of them. It also settles CRLF, where `$` and
  // the trailing `\r` disagree.
  const marker = source
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.startsWith(MARKER))
    ?.slice(MARKER.length)
    .trim()
  if (!marker) return { keys: [], wholeWorkspace: true }

  // The marker line carries tokens and nothing else - prose belongs on the line below it. An
  // unreadable token means the whole workspace rather than a guess: a marker nobody can parse
  // must over-run, never quietly under-run. (It is not hypothetical: "...and nothing else" in a
  // trailing explanation once made a file claim it validated nothing.)
  const claimed = marker.trim().split(/\s+/)
  const known = /^(all|nothing|(app|worker|pkg)__([\w.-]+|\*))$/
  if (claimed.some((token) => !known.test(token))) return { keys: [], wholeWorkspace: true }

  if (claimed.includes('all')) return { keys: [], wholeWorkspace: true }
  if (claimed.includes('nothing')) return { keys: [], wholeWorkspace: false }
  return { keys: claimed, wholeWorkspace: false }
}

/**
 * What the changed workflow files mean between them: extra filter keys to re-validate, and
 * whether any of them means the lot.
 */
export function attributeWorkflows(workflows) {
  const files = ciFiles()
  const claims = workflows.map((name) => ({ name, ...workflowValidates(name) }))
  // By path rather than by name: not every one of these is `<name>.yml` any more.
  const pathOf = (name) => files[name] ?? `${name}.yml`
  const meaning = ({ keys, wholeWorkspace }) => {
    if (wholeWorkspace) return 'it decides how every job runs'
    return keys.join(', ') || 'CI never runs it'
  }
  return {
    keys: claims.flatMap(({ keys }) => keys),
    wholeWorkspace: claims.some((claim) => claim.wholeWorkspace),
    reasons: claims.map((claim) => `${pathOf(claim.name)} changed - ${meaning(claim)}`),
  }
}

/** A member's manifest, read from disk: `prepare` runs before anything is installed. */
const readManifest = (area, dir) =>
  JSON.parse(readFileSync(join(repoRoot, area, dir, 'package.json'), 'utf8'))

/**
 * One matrix row: where the member lives, what to filter pnpm by, and the Codecov flag it uploads
 * under. The flag is the unscoped package name rather than the directory, because two members are
 * called `bench` - `packages/bench` owns the flag `bench`, and `workers/bench` is `bench-api`.
 */
function toRow(area, dir) {
  const pkg = readManifest(area, dir)
  return {
    area,
    dir,
    filter: pkg.name,
    flag: pkg.name.split('/').pop(),
    // A real-browser vitest tier declares `playwright` itself and needs Chromium downloaded
    // first. A member with an e2e script of its own declares it for that instead - the editor's
    // Electron ships its own Chromium, so downloading another would be a minute spent on nothing.
    browsers:
      Boolean(pkg.devDependencies?.playwright ?? pkg.dependencies?.playwright) &&
      !pkg.scripts?.['test:e2e'],
  }
}

/**
 * What ran, from what changed. Pure: `changed` is the paths-filter result, `members` is every
 * workspace member by area, and `attributed` is what the root files were found to mean.
 */
export function assembleChanges({
  changed,
  members,
  attributed = [],
  revalidate = [],
  revalidateAll = false,
  wholeWorkspace = false,
}) {
  // A workflow asking for every job is not the same fact as the workspace having changed.
  // `changes.root` is the second one only: the CD workflows deploy on it, and editing `ci.yml`
  // must re-run the tests without shipping the site and both workers.
  const everything = wholeWorkspace || revalidateAll
  // What the tree actually says changed - this is what `changes.json` reports and what the CD
  // workflows deploy from. A workflow file asking for a job to run is not a change to that area,
  // so it stays out of here: putting `web` in `changes.apps` because `ci-web.yml` moved would
  // deploy the site off a CI edit.
  // `pkg__*` in a marker means every package: a workflow that runs the package matrix asks for
  // all of them without naming twelve directories it would have to be kept in step with.
  const expand = (token) => {
    const wildcard = /^(app__|worker__|pkg__)\*$/.exec(token)
    if (wildcard === null) return [token]
    const [, prefix] = wildcard
    const area = { app__: 'apps', worker__: 'workers', pkg__: 'packages' }[prefix]
    return members[area].map((dir) => `${prefix}${dir}`)
  }

  const recorded = new Set([...changed, ...attributed])
  const gating = new Set([...recorded, ...revalidate.flatMap(expand)])

  const pick = (from, prefix) =>
    [...from].filter((key) => key.startsWith(prefix)).map((key) => key.slice(prefix.length))

  const apps = pick(recorded, 'app__')
  const worker = pick(recorded, 'worker__')
  const packages = pick(recorded, 'pkg__')
  const workflows = pick(recorded, 'wf__')

  const asked = {
    apps: pick(gating, 'app__'),
    workers: pick(gating, 'worker__'),
    packages: pick(gating, 'pkg__'),
  }

  // What each package is called, so a `workspace:` range can be traced back to a directory.
  const dirOf = new Map(members.packages.map((dir) => [readManifest('packages', dir).name, dir]))

  /**
   * A member runs when it changed, when a workflow asked for it, or when a package it declares
   * changed. Derived rather than listed: a hand-written list of consumers is a list to forget the
   * day a dependency moves. Only a real change propagates along those edges - a workflow that
   * asks for the packages says nothing about the apps that consume them.
   */
  const runs = (area, dir) => {
    if (everything) return true
    if (asked[area].includes(dir)) return true

    const manifest = readManifest(area, dir)
    const declared = { ...manifest.dependencies, ...manifest.devDependencies }
    return (
      Object.entries(declared)
        .filter(([, range]) => String(range).startsWith('workspace:'))
        .map(([name]) => dirOf.get(name))
        // `eslint-config` is proved by `lint`, not by re-running every consumer's suite.
        .some((dep) => dep !== undefined && dep !== 'eslint-config' && packages.includes(dep))
    )
  }

  const matrix = (area) => {
    const dirs = members[area].filter((dir) => runs(area, dir))
    return { has: dirs.length > 0, include: dirs.map((dir) => toRow(area, dir)) }
  }
  const changedPackages = matrix('packages')
  const changedWorkers = matrix('workers')

  return {
    changes: { apps, worker, packages, workflows, root: wholeWorkspace },
    outputs: {
      // The two apps have a workflow each, so they gate on a boolean rather than a matrix row.
      web: runs('apps', 'web'),
      editor: members.apps.includes('editor') && runs('apps', 'editor'),
      has_packages: changedPackages.has,
      changed_packages: { include: changedPackages.include },
      has_workers: changedWorkers.has,
      changed_workers: { include: changedWorkers.include },
    },
  }
}

/**
 * A file as the base commit had it, or null when there is nothing to compare against. The copies
 * are laid out by the workflow step before this one - the rules live here, `git` stays there.
 * An empty file is a `git show` that found nothing, which is no answer either.
 */
function fileAtBase(file) {
  const path = {
    'package.json': process.env.BASE_PACKAGE_JSON,
    'pnpm-lock.yaml': process.env.BASE_LOCKFILE,
  }[file]
  if (!path || !existsSync(path)) return null
  const contents = readFileSync(path, 'utf8')
  return contents === '' ? null : contents
}

/**
 * Reads the root files that changed and reports what they mean. Anything that cannot be compared
 * against its previous version counts as the whole workspace - the safe answer is the slow one.
 */
export function attributeRootFiles(changed, read = fileAtBase) {
  const touched = Object.keys(ROOT_FILES).filter((key) => changed.includes(key))
  if (touched.length === 0) return { attributed: [], wholeWorkspace: false, reasons: [] }

  const reasons = []
  const attributed = []
  let wholeWorkspace = false

  for (const key of touched.filter((key) => WHOLE_WORKSPACE.has(key))) {
    wholeWorkspace = true
    reasons.push(`${ROOT_FILES[key]} changed - it shapes the whole workspace`)
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
  const members = Object.fromEntries(AREAS.map(({ dir }) => [dir, dirsWithPackageJson(dir)]))

  const root = attributeRootFiles(changed)
  const workflows = attributeWorkflows(
    changed.filter((key) => key.startsWith('wf__')).map((key) => key.slice('wf__'.length))
  )
  // `ci__any`'s matched paths, laid alongside CHANGES by the same paths-filter step. Missing or
  // unreadable stays null: `unclaimedCiPaths` then rules nothing out.
  let ciAnyFiles = null
  try {
    const parsed = JSON.parse(process.env.CI_ANY_FILES)
    if (Array.isArray(parsed)) ciAnyFiles = parsed
  } catch {
    /* null already says it */
  }
  const unclaimed = unclaimedCiPaths(changed, ciAnyFiles)
  const unattributedCi = changed.includes(CI_DELETED) || unclaimed === null || unclaimed.length > 0
  const reasons = [...root.reasons, ...workflows.reasons]
  if (changed.includes(CI_DELETED)) reasons.push('a CI file was deleted - nothing left to claim it')
  if (unclaimed === null) {
    reasons.push('a CI file changed and the matched paths could not be read')
  } else if (unclaimed.length > 0) {
    reasons.push(`CI files changed that no per-file key claims - ${unclaimed.join(', ')}`)
  }
  for (const reason of reasons) console.error(`changes: ${reason}`)

  const { changes, outputs } = assembleChanges({
    changed,
    members,
    attributed: root.attributed,
    revalidate: workflows.keys,
    revalidateAll: workflows.wholeWorkspace || unattributedCi,
    wholeWorkspace: root.wholeWorkspace,
  })

  writeFileSync(join(repoRoot, 'changes.json'), JSON.stringify(changes))
  for (const [key, value] of Object.entries(outputs)) {
    console.log(`${key}=${typeof value === 'object' ? JSON.stringify(value) : value}`)
  }
}

// Importing this file for its pure parts must not run the CLI.
if (process.argv[1] === fileURLToPath(import.meta.url)) main()
