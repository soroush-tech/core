import { resolve } from 'node:path'
import playwrightCoverage, {
  type PlaywrightCoverageOptions,
} from '@soroush.tech/playwright-coverage'

export const isCoverageEnabled = process.env.E2E_COVERAGE === 'true'

/** Where per-test raw V8 dumps land before aggregation; fixtures.ts writes here too. */
export const rawCoverageDir = resolve('./coverage/e2e/.raw')

/**
 * E2E coverage instance, scoped to the two entry files excluded from unit
 * coverage (see vitest.config.ts): the renderer entry collected through
 * `page.coverage` and the main entry through NODE_V8_COVERAGE - both wired in
 * fixtures.ts. Electron serves the built app from file:// rather than
 * localhost, so the package's default entryFilter is replaced with one that
 * keeps the out/ bundles. Written to coverage/e2e/lcov.info.
 */
export const coverageOptions: PlaywrightCoverageOptions = {
  enabled: isCoverageEnabled,
  include: ['src/main/index.ts', 'src/renderer/src/main.tsx'],
  rawDir: rawCoverageDir,
  report: {
    name: 'Editor E2E Coverage',
    outputDir: './coverage/e2e',
    lcov: true,
    reports: ['console-summary'],
    entryFilter: (entry: { url: string }) => entry.url.includes('/out/'),
  },
}

export const e2eCoverage = playwrightCoverage(coverageOptions)
