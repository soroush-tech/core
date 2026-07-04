/**
 * coverage-check — assert per-file coverage from an lcov report.
 *
 * Parses the same `coverage/lcov.info` that CI uploads to Codecov
 * (see .github/workflows/ci-web.yml) and exits non-zero if any matched source
 * file falls below the threshold.
 *
 * Usage:
 *   pnpm test:coverage:unit                            # generate coverage/lcov.info first
 *   pnpm coverage:check src/section/Article            # check files whose path contains a filter
 *   pnpm coverage:check                                # check every file in the report
 *   pnpm coverage:check --threshold=90 src/common      # custom threshold (default 100)
 *   pnpm coverage:check --file=coverage/e2e/lcov.info  # parse the e2e report instead
 *   pnpm coverage:check:e2e                            # ^ shorthand: check the e2e report
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

type Metric = [hit: number, found: number]

interface FileCoverage {
  file: string
  lines: Metric
  branches: Metric
  functions: Metric
}

const args = process.argv.slice(2)
let lcovPath = 'coverage/lcov.info'
let threshold = 100
const filters: string[] = []

for (const arg of args) {
  if (arg.startsWith('--file=')) lcovPath = arg.slice('--file='.length)
  else if (arg.startsWith('--threshold=')) threshold = Number(arg.slice('--threshold='.length))
  else filters.push(arg.replaceAll('\\', '/'))
}

let raw: string
try {
  raw = readFileSync(resolve(process.cwd(), lcovPath), 'utf8')
} catch {
  console.error(`✖ coverage report not found: ${lcovPath}`)
  console.error('  Generate it first, e.g. `pnpm test:coverage:unit`.')
  process.exit(1)
}

const sum = (block: string, key: string): number => {
  const match = new RegExp(String.raw`^${key}:(\d+)`, 'm').exec(block)
  return match ? Number(match[1]) : 0
}

const files: FileCoverage[] = []
for (const block of raw.split('end_of_record')) {
  const sf = /^SF:(.*)$/m.exec(block)
  if (!sf) continue
  files.push({
    file: sf[1].trim().replaceAll('\\', '/'),
    lines: [sum(block, 'LH'), sum(block, 'LF')],
    branches: [sum(block, 'BRH'), sum(block, 'BRF')],
    functions: [sum(block, 'FNH'), sum(block, 'FNF')],
  })
}

const matched = filters.length
  ? files.filter((file) => filters.some((filter) => file.file.includes(filter)))
  : files

if (!matched.length) {
  console.error(`✖ no files in ${lcovPath} matched: ${filters.join(', ') || '(all)'}`)
  process.exit(1)
}

const pct = ([hit, found]: Metric): number => (found === 0 ? 100 : (hit / found) * 100)
const cell = (metric: Metric): string => `${pct(metric).toFixed(0)}% (${metric[0]}/${metric[1]})`
const rel = (file: string): string =>
  file.includes('/src/') ? `src/${file.split('/src/')[1]}` : file

const rows = matched.map((file) => {
  const ok = [file.lines, file.branches, file.functions].every((metric) => pct(metric) >= threshold)
  return {
    ok,
    file: rel(file.file),
    l: cell(file.lines),
    b: cell(file.branches),
    f: cell(file.functions),
  }
})

const width = Math.max(4, ...rows.map((row) => row.file.length))
console.log(`Coverage check — threshold ${threshold}% — ${lcovPath}\n`)
console.log(
  `  ${'FILE'.padEnd(width)}  ${'LINES'.padEnd(13)}${'BRANCH'.padEnd(13)}${'FUNCS'.padEnd(13)}`
)
for (const row of rows) {
  console.log(
    `${row.ok ? '✓' : '✗'} ${row.file.padEnd(width)}  ${row.l.padEnd(13)}${row.b.padEnd(13)}${row.f.padEnd(13)}`
  )
}

const failed = rows.filter((row) => !row.ok).length
console.log('')
if (failed) {
  console.error(`✖ ${failed}/${rows.length} file(s) below ${threshold}%`)
  process.exit(1)
}
console.log(`✓ ${rows.length} file(s) at/above ${threshold}%`)
