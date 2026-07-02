#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { dirname } from 'node:path'
import { pathToFileURL } from 'node:url'
import { bench, boxplot, run, summary } from 'mitata'
import defineBench, { isBenchConfig, type BenchConfig } from './index'
import {
  formatDeltas,
  formatMarkdown,
  installSpecs,
  loadModules,
  medianRounds,
  registerCases,
} from './runner'

/** Writable tmpfs the sandbox mounts; aliased package versions install here. */
const INSTALL_DIR = '/bench'

// Resolve npm by absolute path (it ships beside node in the sandbox image) rather
// than looking it up on PATH, so the command can't be shadowed by a writable-dir
// entry planting a fake `npm`. — S4036
const npm = `${dirname(process.execPath)}/npm`

// Accept both forms of default export: a plain object (no `@soroush.tech/bench`
// import — truly install-free with `npx`), or `defineBench({ … })`. Validate the
// plain object here; pass an already-defined config through untouched.
const benchFile = process.argv[2]
const loaded = ((await import(pathToFileURL(benchFile).href)) as { default: BenchConfig }).default
const config = isBenchConfig(loaded) ? loaded : defineBench(loaded)

const specs = installSpecs(config.packages)
if (specs.length > 0) {
  spawnSync(npm, ['init', '-y'], { cwd: INSTALL_DIR, stdio: 'inherit' })
  const installed = spawnSync(npm, ['install', '--no-audit', '--no-fund', ...specs], {
    cwd: INSTALL_DIR,
    stdio: 'inherit',
  })
  if (installed.status !== 0) {
    throw new Error('bench: installing benchmark packages failed')
  }
}

// Resolve each alias from the install dir, then import it as a module URL so
// both ESM and CJS packages load uniformly.
const requireFromInstall = createRequire(`${INSTALL_DIR}/`)
const modules = await loadModules(
  config.packages,
  (alias) => import(pathToFileURL(requireFromInstall.resolve(alias)).href)
)

type Stats = { avg?: number; p75?: number; heap?: { avg?: number }; gc?: { avg?: number } }
type RunResults = { benchmarks: { alias: string; runs: { stats?: Stats }[] }[] }
type Row = {
  label: string
  avg: number
  p75: number
  alloc: number | undefined
  gc: number | undefined
}

const silent = { print() {} } as Parameters<typeof run>[0]
const extract = (results: RunResults): Row[] =>
  results.benchmarks
    .map((b) => ({
      label: b.alias,
      avg: b.runs[0]?.stats?.avg,
      p75: b.runs[0]?.stats?.p75,
      alloc: b.runs[0]?.stats?.heap?.avg,
      gc: b.runs[0]?.stats?.gc?.avg,
    }))
    .filter((r): r is Row => typeof r.avg === 'number' && typeof r.p75 === 'number')

// defineBench `options` supply defaults; the matching CLI flag overrides each.
const options = config.options ?? {}
const md = process.argv.includes('--md')

// gc: `--gc-inner` forces 'inner'; otherwise config.options.gc (mitata default 'once').
const gcMode = process.argv.includes('--gc-inner') ? 'inner' : options.gc
const registrar =
  gcMode !== undefined
    ? (name: string, fn: () => unknown) => void bench(name, fn).gc(gcMode)
    : bench
const register = () => registerCases(config, modules, registrar)

// rounds: `--rounds N` overrides config.options.rounds (default 1).
const roundsFlag = process.argv.indexOf('--rounds')
const rounds = roundsFlag >= 0 ? Number(process.argv[roundsFlag + 1]) : (options.rounds ?? 1)

// warmup: call each case this many times before measuring, to pre-warm the JIT.
const warmup = options.warmup ?? 0
if (warmup > 0) {
  const ctx = { modules }
  for (let i = 0; i < warmup; i++) {
    for (const fn of Object.values(config.cases)) await fn(ctx)
  }
}

if (rounds > 1) {
  // Repeat the whole suite (re-registering each round — run() consumes the
  // registered cases). Each round's mitata output is suppressed; we print a
  // one-line progress update per round to stderr (keeping stdout clean for the
  // final table), then report the median per case to cancel cross-run noise.
  const shortLabel = (label: string) =>
    label.includes('::') ? label.slice(label.lastIndexOf('::') + 2).trim() : label
  const perRound: Row[][] = []
  for (let i = 0; i < rounds; i++) {
    // Show a "running…" line, then overwrite it in place with the round's result
    // (\r returns to line start, \x1b[K clears the leftover text).
    process.stderr.write(`round ${i + 1}/${rounds} running…`)
    register()
    const roundRows = extract((await run(silent)) as RunResults)
    perRound.push(roundRows)
    const summary = roundRows.map((r) => `${shortLabel(r.label)} ${(r.avg / 1000).toFixed(2)}µs`)
    process.stderr.write(`\r\x1b[Kround ${i + 1}/${rounds} · ${summary.join(' · ')}\n`)
  }
  console.log(`\n# median of ${rounds} rounds\n`)
  console.log(formatMarkdown(medianRounds(perRound)))
} else {
  // boxplot draws a comparative chart; summary adds the "Nx faster …" line.
  // mitata always prints its full report (chart + per-case histograms incl. the
  // GC/heap rows + summary); we then append our own summary — a markdown table
  // under `--md`, or the plain "% slower" lines otherwise.
  boxplot(() => {
    summary(() => {
      register()
    })
  })
  const rows = extract((await run()) as RunResults)
  if (md) {
    console.log(`\n${formatMarkdown(rows)}`)
  } else {
    const deltas = formatDeltas(rows.map((r) => ({ label: r.label, avg: r.avg })))
    if (deltas) console.log(`\n${deltas}`)
  }
}
