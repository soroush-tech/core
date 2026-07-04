import playwrightCoverage from '@soroush.tech/playwright-coverage'

/**
 * E2E coverage instance. V8 coverage from the preview build is mapped back to the Vike page
 * entry files (`src/pages/**\/+Page.*`) — the only page sources excluded from unit coverage
 * (see vitest.config.ts) — and written to `coverage/e2e/lcov.info` for Codecov. localhost
 * `entryFilter` and repo-relative `sourcePath` come from the package defaults.
 */
export const e2eCoverage = playwrightCoverage({
  enabled: process.env.E2E_COVERAGE === 'true',
  include: ['src/pages/**/+Page.{tsx,jsx}'],
  report: {
    name: 'E2E Coverage',
    outputDir: './coverage/e2e',
    lcov: true,
    reports: ['console-summary'],
  },
})
