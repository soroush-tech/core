/**
 * The context handed to every benchmark case at call time.
 *
 * `modules` maps each alias declared in {@link BenchConfig.packages} to its
 * resolved module namespace. Comparing two versions of the same package is the
 * reason cases receive their modules here rather than importing at the top
 * level: Node cannot hold two versions of one bare specifier in a single graph,
 * so the harness installs each under its alias and injects them.
 */
export interface BenchContext {
  modules: Record<string, unknown>
}

/** A single function under test. Receives the {@link BenchContext}. */
export type BenchCase = (ctx: BenchContext) => unknown | Promise<unknown>

/**
 * Per-bench run defaults. Each is a default that the matching CLI flag overrides
 * at run time (sandbox/pinning options like `--cpuset`/`--memory` are CLI-only —
 * they shape `docker run` before this config is ever loaded).
 */
export interface BenchOptions {
  /**
   * Garbage-collection mode: `'once'` (after warmup — mitata's default),
   * `'inner'` (before each iteration → adds a per-iter GC-timing row), or
   * `false` to disable. Overridden by the `--gc-inner` CLI flag.
   */
  gc?: false | 'once' | 'inner'
  /** Repeat the whole suite N times, reporting the median per case. Overridden by `--rounds`. */
  rounds?: number
  /** Warmup iterations run (per case) before measuring, to pre-warm the JIT. */
  warmup?: number
  /**
   * Sandbox/pinning defaults, read on the host before `docker run` (each
   * overridden by the matching CLI flag). Only applied when the CLI can load
   * this file on the host; otherwise pass the flags directly.
   */
  sandbox?: {
    /** `--cpuset-cpus` — logical CPU(s) to pin to. */
    cpuset?: string
    /** `--cpus` — CPU quota. */
    cpus?: number
    /** `--memory` — memory cap (swap pinned to the same). */
    memory?: string
    /** Sandbox image tag (`--tag`). */
    tag?: string
    /** Extra `-v` volumes (`host:container[:ro]`); CLI `--mount`s are appended. */
    mount?: string[]
  }
}

export interface BenchConfig {
  /** Human label for the comparison; prefixes every case in the report. */
  name: string
  /**
   * Optional `alias -> npm install spec` map (e.g. `{ v4: 'lodash@4.17.21' }`).
   * The harness installs each under its alias and exposes it on
   * `ctx.modules[alias]`, enabling two-or-more-versions-of-one-package runs.
   */
  packages?: Record<string, string>
  /** The named versions to compare. At least two are required. */
  cases: Record<string, BenchCase>
  /** Default run options; each is overridable by the matching CLI flag. */
  options?: BenchOptions
}

/** Brand marking a config already validated by defineBench. */
const DEFINED = Symbol('soroush-bench.defined')

/** True if `value` was produced by defineBench (already validated + frozen). */
export function isBenchConfig(value: unknown): value is Readonly<BenchConfig> {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Record<symbol, unknown>)[DEFINED] === true
  )
}

/**
 * Validates and freezes a benchmark definition. Authored in a `*.bench.ts`
 * file and `export default`-ed; the `soroush-bench` CLI loads that default export
 * inside the pinned container. A plain-object export works too — the harness runs
 * it through defineBench (see {@link isBenchConfig}), so no import is required.
 */
export default function defineBench(config: BenchConfig): Readonly<BenchConfig> {
  if (typeof config.name !== 'string' || config.name.trim() === '') {
    throw new TypeError('defineBench: `name` must be a non-empty string')
  }

  const caseEntries = Object.entries(config.cases ?? {})
  if (caseEntries.length < 2) {
    throw new TypeError('defineBench: `cases` must define at least two cases to compare')
  }
  for (const [key, fn] of caseEntries) {
    if (typeof fn !== 'function') {
      throw new TypeError(`defineBench: case "${key}" must be a function`)
    }
  }

  for (const [alias, spec] of Object.entries(config.packages ?? {})) {
    if (typeof spec !== 'string' || spec.trim() === '') {
      throw new TypeError(`defineBench: package "${alias}" must map to a non-empty install spec`)
    }
  }

  const options = config.options ?? {}
  if (
    options.gc !== undefined &&
    options.gc !== false &&
    options.gc !== 'once' &&
    options.gc !== 'inner'
  ) {
    throw new TypeError("defineBench: `options.gc` must be false, 'once', or 'inner'")
  }
  if (options.rounds !== undefined && (!Number.isInteger(options.rounds) || options.rounds < 1)) {
    throw new TypeError('defineBench: `options.rounds` must be a positive integer')
  }
  if (options.warmup !== undefined && (!Number.isInteger(options.warmup) || options.warmup < 0)) {
    throw new TypeError('defineBench: `options.warmup` must be a non-negative integer')
  }
  const cpus = options.sandbox?.cpus
  if (cpus !== undefined && (!Number.isFinite(cpus) || cpus <= 0)) {
    throw new TypeError('defineBench: `options.sandbox.cpus` must be a positive number')
  }

  const defined = { ...config }
  Object.defineProperty(defined, DEFINED, { value: true })
  return Object.freeze(defined)
}
