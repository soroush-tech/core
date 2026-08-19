import type { expect, test } from '@playwright/test'
import type { CoverageReportOptions } from 'monocart-coverage-reports'

/**
 * Structural shape of Playwright's `page.coverage`. Declared structurally so the collector
 * can be unit-tested with a fake (no real browser) and so the package needs no Playwright
 * page type at this seam.
 */
export interface JsCoverageSource {
  startJSCoverage(options?: { resetOnNavigation?: boolean }): Promise<void>
  stopJSCoverage(): Promise<unknown[]>
}

/** The subset of a Playwright fixture's first argument that the collector reads. */
export interface CoverageFixtureArgs {
  page: { coverage: JsCoverageSource }
  browserName: string
}

export interface PlaywrightCoverageOptions {
  /** Collect coverage only when `true`; otherwise every piece is an inert no-op. */
  enabled: boolean
  /**
   * monocart report config - you provide `name`, `outputDir`, `lcov`. `entryFilter` defaults to
   * "served from localhost" and `sourcePath` to "repo-relative" when you omit them. Scope which
   * sources land in the report with `include`/`exclude` below (preferred), or set `sourceFilter`
   * here for full monocart control.
   */
  report: CoverageReportOptions
  /**
   * Glob(s) of source paths to include in the report, matched against the repo-relative path
   * (e.g. `'src/**\/*.{ts,tsx}'`). When set, these build the report's `sourceFilter`, taking
   * precedence over any `report.sourceFilter`.
   */
  include?: string | string[]
  /** Glob(s) to exclude; takes priority over `include`. */
  exclude?: string | string[]
  /** Where per-test raw V8 dumps are written before aggregation. Default: `${outputDir}/.raw`. */
  rawDir?: string
  /** Only this Playwright browser is instrumented - V8 coverage is Chromium-only. Default: `'chromium'`. */
  browser?: 'chromium' | 'firefox' | 'webkit'
}

export interface PlaywrightCoverage {
  /** Drop-in replacement for `@playwright/test`'s `test`, auto-collecting per-test coverage. */
  test: typeof test
  expect: typeof expect
  /** Playwright `globalSetup`: clears stale raw coverage before the run. */
  globalSetup: () => Promise<void>
  /** Playwright `globalTeardown`: aggregates raw V8 dumps into the configured report. */
  globalTeardown: () => Promise<void>
}
