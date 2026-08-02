import { randomUUID } from 'node:crypto'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { delimiter, join } from 'node:path'
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

/** What the stubbed CLI writes before its answer, and what it answers with. */
export const CLAUDE_STUB_DELTA = 'writing... '
export const CLAUDE_STUB_ANSWER = 'STUBBED ANSWER'

const line = (payload: unknown) => JSON.stringify(payload)

const DELTA_LINE = line({
  type: 'stream_event',
  event: { type: 'content_block_delta', delta: { type: 'text_delta', text: CLAUDE_STUB_DELTA } },
})
const RESULT_LINE = line({ type: 'result', subtype: 'success', result: CLAUDE_STUB_ANSWER })

/**
 * Puts a fake `claude` on PATH: streams one delta, waits, then answers. Every
 * launch gets it, so no test can reach the real CLI — that would spend the
 * developer's own tokens and need them signed in.
 *
 * The pause is what makes both halves testable: the delta is on screen while
 * the run is still going, which is also the only moment Cancel exists.
 */
function writeClaudeStub(): string {
  const dir = mkdtempSync(join(tmpdir(), 'claude-stub-'))
  if (process.platform === 'win32') {
    // `timeout` refuses to run with stdin redirected, which it is here.
    const script = `@echo off\r\necho ${DELTA_LINE}\r\nping -n 3 127.0.0.1 >nul\r\necho ${RESULT_LINE}\r\n`
    writeFileSync(join(dir, 'claude.cmd'), script)
  } else {
    const script = `#!/bin/sh\nprintf '%s\\n' '${DELTA_LINE}'\nsleep 2\nprintf '%s\\n' '${RESULT_LINE}'\n`
    writeFileSync(join(dir, 'claude'), script, { mode: 0o755 })
  }
  return dir
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
        PATH: `${writeClaudeStub()}${delimiter}${process.env.PATH ?? ''}`,
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
