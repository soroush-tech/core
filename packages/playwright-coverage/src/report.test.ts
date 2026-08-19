import { describe, expect, it, vi } from 'vitest'
import { resolve } from 'node:path'
import process from 'node:process'
import type { CoverageReportOptions } from 'monocart-coverage-reports'
import {
  buildSourceFilter,
  defaultEntryFilter,
  defaultSourcePath,
  resolveRawDir,
  resolveReportOptions,
  toGlobs,
} from './report'
import type { PlaywrightCoverageOptions } from './types'

const opts = (o: Partial<PlaywrightCoverageOptions>): PlaywrightCoverageOptions =>
  ({ enabled: true, report: { name: 'T', outputDir: '.' }, ...o }) as PlaywrightCoverageOptions

describe('defaultEntryFilter', () => {
  it('keeps localhost entries and drops the rest', () => {
    expect(defaultEntryFilter({ url: 'http://localhost/app.js' })).toBe(true)
    expect(defaultEntryFilter({ url: 'https://example.com/app.js' })).toBe(false)
  })
})

describe('defaultSourcePath', () => {
  it('strips the cwd prefix and normalizes backslashes', () => {
    const cwd = process.cwd().replace(/\\/g, '/')
    expect(defaultSourcePath(`${cwd}/src/a.ts`)).toBe('src/a.ts')
    expect(defaultSourcePath('D:\\other\\b.ts')).toBe('D:/other/b.ts')
  })
})

describe('toGlobs', () => {
  it('normalizes undefined, a single string, and an array to an array', () => {
    expect(toGlobs(undefined)).toEqual([])
    expect(toGlobs('src/**')).toEqual(['src/**'])
    expect(toGlobs(['a', 'b'])).toEqual(['a', 'b'])
  })
})

describe('resolveRawDir', () => {
  it('uses an explicit rawDir verbatim', () => {
    expect(resolveRawDir(opts({ rawDir: '/tmp/raw' }))).toBe('/tmp/raw')
  })

  it('defaults to <outputDir>/.raw when rawDir is omitted', () => {
    expect(resolveRawDir(opts({ report: { name: 'T', outputDir: 'out' } }))).toBe(
      resolve('out', '.raw')
    )
  })

  it('falls back to ./.raw when neither rawDir nor outputDir is set', () => {
    expect(resolveRawDir(opts({ report: { name: 'T' } as CoverageReportOptions }))).toBe(
      resolve('.', '.raw')
    )
  })
})

describe('buildSourceFilter', () => {
  it('include only - matches included paths (absolute, relative, backslash) and rejects others', () => {
    const filter = buildSourceFilter(opts({ include: ['src/pages/**/+Page.{ts,tsx}'] }))
    if (!filter) throw new Error('expected a source filter')
    const cwd = process.cwd().replace(/\\/g, '/')

    expect(filter('src/pages/about/+Page.tsx')).toBe(true)
    expect(filter(`${cwd}/src/pages/about/+Page.tsx`)).toBe(true)
    expect(filter('src\\pages\\about\\+Page.tsx')).toBe(true)
    expect(filter('src/pages/about/Card.tsx')).toBe(false)
    expect(filter('src/section/Foo.tsx')).toBe(false)
  })

  it('exclude only (string form) - passes everything except excluded', () => {
    const filter = buildSourceFilter(opts({ exclude: '**/*.stories.tsx' }))
    if (!filter) throw new Error('expected a source filter')

    expect(filter('src/common/Button.tsx')).toBe(true)
    expect(filter('src/common/Button.stories.tsx')).toBe(false)
  })

  it('include + exclude - exclude wins over a matching include', () => {
    const filter = buildSourceFilter(
      opts({ include: ['src/**/*.tsx'], exclude: ['**/*.stories.tsx'] })
    )
    if (!filter) throw new Error('expected a source filter')

    expect(filter('src/common/Button.tsx')).toBe(true)
    expect(filter('src/common/Button.stories.tsx')).toBe(false)
  })

  it('globs win over an explicit report.sourceFilter', () => {
    const raw = vi.fn(() => true)
    const filter = buildSourceFilter(
      opts({
        include: ['src/pages/**/+Page.tsx'],
        report: { name: 'T', outputDir: '.', sourceFilter: raw },
      })
    )
    if (!filter) throw new Error('expected a source filter')

    expect(filter('src/pages/x/+Page.tsx')).toBe(true)
    expect(filter('src/other.tsx')).toBe(false)
    expect(raw).not.toHaveBeenCalled()
  })

  it('passes report.sourceFilter through verbatim when no globs are set', () => {
    const raw = (path: string): boolean => path.includes('keep')
    expect(
      buildSourceFilter(opts({ report: { name: 'T', outputDir: '.', sourceFilter: raw } }))
    ).toBe(raw)
  })

  it('leaves sourceFilter undefined when neither globs nor report.sourceFilter is set', () => {
    expect(buildSourceFilter(opts({}))).toBeUndefined()
  })
})

describe('resolveReportOptions', () => {
  it('applies the default entry/source resolvers and the resolved sourceFilter', () => {
    const resolved = resolveReportOptions(
      opts({ report: { name: 'T', outputDir: 'out', lcov: true } })
    )

    expect(resolved.entryFilter).toBe(defaultEntryFilter)
    expect(resolved.sourcePath).toBe(defaultSourcePath)
    expect(resolved.lcov).toBe(true)
    expect(resolved.sourceFilter).toBeUndefined()
  })

  it('lets report overrides win over the defaults', () => {
    const entryFilter = (): boolean => true
    const resolved = resolveReportOptions(
      opts({ include: ['src/**'], report: { name: 'T', outputDir: '.', entryFilter } })
    )

    expect(resolved.entryFilter).toBe(entryFilter)
    expect(typeof resolved.sourceFilter).toBe('function')
  })
})
