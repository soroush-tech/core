import type { BenchConfig } from './index'

/**
 * Turns the `alias -> spec` map into npm alias-install specifiers
 * (`alias@npm:spec`), which let several versions of one package coexist in a
 * single `node_modules`.
 */
export function installSpecs(packages: BenchConfig['packages'] = {}): string[] {
  return Object.entries(packages).map(([alias, spec]) => `${alias}@npm:${spec}`)
}

/** Injected resolver: resolve an alias from `installDir` and import its module. */
export type ModuleResolver = (alias: string) => Promise<unknown>

/** Resolves every declared alias to its module namespace via the resolver. */
export async function loadModules(
  packages: BenchConfig['packages'],
  resolve: ModuleResolver
): Promise<Record<string, unknown>> {
  const modules: Record<string, unknown> = {}
  for (const alias of Object.keys(packages ?? {})) {
    modules[alias] = await resolve(alias)
  }
  return modules
}

/** The subset of mitata the runner depends on; injected so it stays testable. */
export type BenchRegistrar = (name: string, fn: () => unknown) => void

/**
 * Registers each case with the bench registrar, wrapping it so it is called
 * with the shared {@link BenchContext}. Returns the labels in registration
 * order.
 */
export function registerCases(
  config: BenchConfig,
  modules: Record<string, unknown>,
  bench: BenchRegistrar
): string[] {
  const ctx = { modules }
  return Object.entries(config.cases).map(([key, fn]) => {
    const label = `${config.name} :: ${key}`
    bench(label, () => fn(ctx))
    return label
  })
}

/** One case's measured mean runtime (in nanoseconds), keyed by its label. */
export interface CaseMean {
  label: string
  avg: number
}

/**
 * Formats each case's mean as a percentage relative to the fastest case — the
 * explicit "% slower" companion to mitata's "Nx faster" summary. Returns an
 * empty string when there is nothing to compare (fewer than two means).
 */
export function formatDeltas(means: CaseMean[]): string {
  if (means.length < 2) return ''
  const fastest = Math.min(...means.map((m) => m.avg))
  const rows = means.map(({ label, avg }) => {
    const pct = (avg / fastest - 1) * 100
    const delta = pct === 0 ? 'fastest' : `+${pct.toFixed(1)}% slower`
    return `  ${label} — ${delta}`
  })
  return ['delta vs fastest:', ...rows].join('\n')
}

/** One case's headline stats: mean and p75 (nanoseconds) plus mean allocation. */
export interface CaseRow {
  label: string
  avg: number
  p75: number
  /** Mean bytes allocated per iteration; omitted when mitata didn't measure it. */
  alloc?: number
  /** Mean GC time per iteration (ns); only present under `--gc-inner`. */
  gc?: number
}

const formatTime = (ns: number): string => {
  if (ns >= 1e6) return `${(ns / 1e6).toFixed(2)} ms`
  if (ns >= 1e3) return `${(ns / 1e3).toFixed(2)} µs`
  return `${ns.toFixed(0)} ns`
}

const formatBytes = (bytes: number): string => {
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(2)} MB`
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(2)} KB`
  return `${bytes.toFixed(0)} B`
}

/**
 * Renders the run as a GitHub-flavored markdown table (fastest first), one row
 * per case with mean, p75, allocation, and percentage relative to the fastest —
 * for pasting into reports/PRs (the `--md` output). Empty string for no cases.
 */
export function formatMarkdown(rows: CaseRow[]): string {
  if (rows.length === 0) return ''
  const fastest = Math.min(...rows.map((r) => r.avg))
  const leastAlloc = Math.min(
    ...rows.map((r) => r.alloc).filter((a): a is number => typeof a === 'number')
  )
  // The gc/iter column only appears when GC was measured (i.e. under --gc-inner).
  const showGc = rows.some((r) => typeof r.gc === 'number')

  // alloc/iter shows the value plus a % vs the least-allocating case (the memory
  // analogue of "vs fastest").
  const allocCell = (alloc: number | undefined): string => {
    if (alloc === undefined) return '—'
    const pct = (alloc / leastAlloc - 1) * 100
    const delta = pct === 0 ? 'least' : `+${pct.toFixed(1)}%`
    return `${formatBytes(alloc)} (${delta})`
  }

  const header = ['case', 'avg', 'p75', 'alloc/iter', ...(showGc ? ['gc/iter'] : []), 'vs fastest']
  const align = ['---', '---:', '---:', '---:', ...(showGc ? ['---:'] : []), ':---']
  const body = [...rows]
    .sort((a, b) => a.avg - b.avg)
    .map(({ label, avg, p75, alloc, gc }) => {
      const pct = (avg / fastest - 1) * 100
      const cells = [label, formatTime(avg), formatTime(p75), allocCell(alloc)]
      if (showGc) cells.push(gc === undefined ? '—' : formatTime(gc))
      cells.push(pct === 0 ? 'fastest' : `+${pct.toFixed(1)}%`)
      return `| ${cells.join(' | ')} |`
    })
  return [`| ${header.join(' | ')} |`, `| ${align.join(' | ')} |`, ...body].join('\n')
}

/** Median of a non-empty list of numbers (mean of the two middles when even). */
export function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

/**
 * Collapses the per-round rows of a `--rounds N` run into one row per case,
 * taking the median of each stat across rounds — cancelling cross-run noise.
 * Cases keep first-seen order; `alloc` is the median of the rounds that reported it.
 */
export function medianRounds(rounds: CaseRow[][]): CaseRow[] {
  const order: string[] = []
  const byLabel = new Map<string, CaseRow[]>()
  for (const round of rounds) {
    for (const row of round) {
      const existing = byLabel.get(row.label)
      if (existing) existing.push(row)
      else {
        byLabel.set(row.label, [row])
        order.push(row.label)
      }
    }
  }
  return order.map((label) => {
    const rows = byLabel.get(label) as CaseRow[]
    const allocs = rows.map((r) => r.alloc).filter((a): a is number => typeof a === 'number')
    const gcs = rows.map((r) => r.gc).filter((g): g is number => typeof g === 'number')
    return {
      label,
      avg: median(rows.map((r) => r.avg)),
      p75: median(rows.map((r) => r.p75)),
      alloc: allocs.length > 0 ? median(allocs) : undefined,
      gc: gcs.length > 0 ? median(gcs) : undefined,
    }
  })
}
