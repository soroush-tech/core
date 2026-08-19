import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import type { CoverageFixtureArgs, PlaywrightCoverageOptions } from './types'
import { resolveRawDir } from './report'

/**
 * Captures one test's V8 JS coverage. Exposed via {@link createAutoCoverageFixture} as the
 * Playwright fixture tuple so the body stays directly unit-testable with a fake `page`.
 */
const collect = async (
  options: PlaywrightCoverageOptions,
  { page, browserName }: CoverageFixtureArgs,
  use: () => Promise<void>
): Promise<void> => {
  const active = options.enabled && browserName === (options.browser ?? 'chromium')
  if (active) {
    await page.coverage.startJSCoverage({ resetOnNavigation: false })
  }

  await use()

  if (active) {
    const coverage = await page.coverage.stopJSCoverage()
    const rawDir = resolveRawDir(options)
    mkdirSync(rawDir, { recursive: true })
    writeFileSync(join(rawDir, `${randomUUID()}.json`), JSON.stringify(coverage))
  }
}

/** The Playwright fixture tuple: `[fixtureFn, { scope, auto }]`. */
export type CoverageFixtureTuple = [
  (args: CoverageFixtureArgs, use: () => Promise<void>) => Promise<void>,
  { scope: 'test'; auto: true },
]

/**
 * Builds the auto fixture that collects per-test coverage. Returned as a tuple (rather than a
 * hidden `base.extend` arrow) so the fixture body is callable - and thus unit-testable - directly.
 */
export const createAutoCoverageFixture = (
  options: PlaywrightCoverageOptions
): CoverageFixtureTuple => [
  // Playwright statically parses fixture fns and requires the first arg to be destructured
  // (that's how it discovers fixture deps), so name `page`/`browserName` here explicitly.
  ({ page, browserName }, use) => collect(options, { page, browserName }, use),
  { scope: 'test', auto: true },
]
