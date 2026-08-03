import { randomUUID } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test as base } from '@playwright/test'
import { _electron as electron, type ElectronApplication } from 'playwright'
import { isCoverageEnabled, rawCoverageDir } from './coverage'

/** One V8 script coverage entry; NODE_V8_COVERAGE dumps carry no `source`. */
interface V8ScriptCoverage {
  url: string
  source?: string
}

/** Writes one raw dump in the format the shared globalTeardown aggregates. */
const writeRawDump = (entries: V8ScriptCoverage[]): void => {
  mkdirSync(rawCoverageDir, { recursive: true })
  writeFileSync(join(rawCoverageDir, `${randomUUID()}.json`), JSON.stringify(entries))
}

/**
 * Converts the main process's NODE_V8_COVERAGE dumps into a raw dump: keeps
 * only the built main bundle and attaches its source so monocart can resolve
 * the inline sourcemap back to src/main.
 */
const harvestMainCoverage = (coverageDir: string): void => {
  const entries: V8ScriptCoverage[] = []
  for (const file of readdirSync(coverageDir)) {
    if (!file.endsWith('.json')) continue
    const dump = JSON.parse(readFileSync(join(coverageDir, file), 'utf8')) as {
      result: V8ScriptCoverage[]
    }
    for (const entry of dump.result) {
      if (!entry.url.endsWith('out/main/index.js')) continue
      entries.push({ ...entry, source: readFileSync(fileURLToPath(entry.url), 'utf8') })
    }
  }
  if (entries.length) writeRawDump(entries)
}

export interface ElectronFixtures {
  /** The Electron app under test, one fresh instance per test. */
  electronApp: ElectronApplication
}

/**
 * Drop-in replacement for `@playwright/test`'s `test`: launches the built
 * Electron app per test and rebinds `page` to its window. With
 * `E2E_COVERAGE=true` it also collects V8 coverage from both processes.
 */
export const test = base.extend<ElectronFixtures>({
  // eslint-disable-next-line no-empty-pattern
  electronApp: async ({}, run) => {
    // Under the raw dir so the coverage globalSetup wipes stale dumps with it.
    const mainCoverageDir = join(rawCoverageDir, `main-${randomUUID()}`)
    const app = await electron.launch({
      args: ['.'],
      env: {
        ...(process.env as Record<string, string>),
        ...(isCoverageEnabled ? { NODE_V8_COVERAGE: mainCoverageDir } : {}),
      },
    })
    await run(app)
    if (isCoverageEnabled) {
      // Flush main-process coverage; a test may already have quit the app
      // (closing its last window), in which case exit already wrote it.
      await app
        .evaluate(() => process.getBuiltinModule('node:v8').takeCoverage())
        .catch(() => undefined)
    }
    // A dirty document intercepts quit with a modal discard prompt; destroy
    // the windows so teardown never hangs on a dialog nobody can answer.
    await app
      .evaluate(({ BrowserWindow }) => {
        for (const window of BrowserWindow.getAllWindows()) window.destroy()
      })
      .catch(() => undefined)
    await app.close().catch(() => undefined)
    if (isCoverageEnabled && existsSync(mainCoverageDir)) harvestMainCoverage(mainCoverageDir)
  },
  page: async ({ electronApp }, run) => {
    const page = await electronApp.firstWindow()
    if (isCoverageEnabled) {
      await page.coverage.startJSCoverage({ resetOnNavigation: false })
      // The renderer entry already ran during launch, before coverage could
      // attach — reload so it re-executes instrumented.
      await page.reload()
    }
    await run(page)
    if (isCoverageEnabled && !page.isClosed()) {
      writeRawDump(await page.coverage.stopJSCoverage())
    }
  },
})
