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
    // Page code compiles into per-page entry chunks (`assets/entries/src_pages_*.js`); the
    // shared `assets/chunks/*` never hold page source. Some carry bytes monocart can't map to
    // a source, so it reports the raw chunk — bypassing the source filter and polluting the
    // pages report. Drop them here (keeping the package default "served from localhost").
    entryFilter: (entry) =>
      entry.url.includes('://localhost') && !entry.url.includes('/assets/chunks/'),
  },
})
