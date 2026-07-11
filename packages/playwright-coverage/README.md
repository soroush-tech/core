# @soroush.tech/playwright-coverage

[![npm version](https://img.shields.io/npm/v/@soroush.tech/playwright-coverage.svg)](https://www.npmjs.com/package/@soroush.tech/playwright-coverage)
[![npm downloads](https://img.shields.io/npm/dm/@soroush.tech/playwright-coverage.svg)](https://www.npmjs.com/package/@soroush.tech/playwright-coverage)
[![coverage](https://codecov.io/gh/soroush-tech/core/branch/main/graph/badge.svg?flag=playwright-coverage)](https://app.codecov.io/gh/soroush-tech/core?flags%5B0%5D=playwright-coverage)
[![unpacked size](https://img.shields.io/npm/unpacked-size/@soroush.tech/playwright-coverage.svg)](https://www.npmjs.com/package/@soroush.tech/playwright-coverage)
[![types included](https://img.shields.io/npm/types/@soroush.tech/playwright-coverage.svg)](https://www.npmjs.com/package/@soroush.tech/playwright-coverage)
[![license](https://img.shields.io/npm/l/@soroush.tech/playwright-coverage.svg)](./LICENSE)

Collect **per-test V8 JS coverage** from a [Playwright](https://playwright.dev) e2e run and
aggregate it into an **lcov** report (source-mapped back to your original sources) via
[monocart-coverage-reports](https://github.com/cenfun/monocart-coverage-reports).

It wires three things together:

- an **auto fixture** that starts/stops `page.coverage` around every test (Chromium only — V8
  JS coverage is Chromium-specific) and writes each test's raw dump to disk,
- a **`globalSetup`** that clears stale raw coverage before the run, and
- a **`globalTeardown`** that merges every raw dump into one report.

You bring your own scoping (`include`/`exclude` globs) and output location; everything else has
sane defaults.

## Install

```sh
# npm
npm install -D @soroush.tech/playwright-coverage @playwright/test monocart-coverage-reports
```

```sh
# pnpm
pnpm add -D @soroush.tech/playwright-coverage @playwright/test monocart-coverage-reports
```

```sh
# yarn
yarn add -D @soroush.tech/playwright-coverage @playwright/test monocart-coverage-reports
```

`@playwright/test` (`^1`) and `monocart-coverage-reports` (`^2`) are **peer dependencies** — you
install them, the package carries neither at runtime.

## Usage

Gate it on an env flag so normal runs skip the (slower) instrumented build.

**1. One shared instance** — `src/test/e2e/coverage.ts`:

```ts
import playwrightCoverage from '@soroush.tech/playwright-coverage'

export const e2eCoverage = playwrightCoverage({
  enabled: process.env.E2E_COVERAGE === 'true',
  // Scope the report to whatever you want measured by e2e — globs, like vitest's `include`:
  include: ['src/pages/**/*.{ts,tsx}'],
  exclude: ['**/*.stories.tsx'],
  report: {
    name: 'E2E Coverage',
    outputDir: './coverage/e2e',
    lcov: true,
    reports: ['console-summary'],
  },
})
```

**2. Re-export the parts** where Playwright expects them:

```ts
// src/test/e2e/fixtures.ts
export const { test, expect } = e2eCoverage
```

```ts
// src/test/e2e/coverage.setup.ts
export default e2eCoverage.globalSetup
```

```ts
// src/test/e2e/coverage.teardown.ts
export default e2eCoverage.globalTeardown
```

**3. Point `playwright.config.ts` at the setup/teardown** and write tests with the exported `test`:

```ts
// playwright.config.ts
export default defineConfig({
  globalSetup: './src/test/e2e/coverage.setup.ts',
  globalTeardown: './src/test/e2e/coverage.teardown.ts',
})
```

```ts
// some.e2e.ts
import { test, expect } from './fixtures'

test('renders', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Home/)
})
```

Run it: `E2E_COVERAGE=true playwright test --project=chromium` → `coverage/e2e/lcov.info`.

## Options

| Option    | Type                    | Default             | Description                                                        |
| --------- | ----------------------- | ------------------- | ------------------------------------------------------------------ |
| `enabled` | `boolean`               | —                   | Collect only when `true`; otherwise every piece is an inert no-op. |
| `report`  | `CoverageReportOptions` | —                   | monocart config (`name`, `outputDir`, `lcov`, …).                  |
| `include` | `string \| string[]`    | —                   | Glob(s) of source paths to include in the report (repo-relative).  |
| `exclude` | `string \| string[]`    | —                   | Glob(s) to exclude; takes priority over `include`.                 |
| `rawDir`  | `string`                | `${outputDir}/.raw` | Where per-test raw V8 dumps are written before aggregation.        |
| `browser` | `string`                | `'chromium'`        | The only Playwright browser that gets instrumented.                |

`include`/`exclude` are the ergonomic way to scope the report; they match the **repo-relative**
source path (cwd stripped, forward slashes), so `src/**`-style globs work cross-platform. When both
globs and a raw `report.sourceFilter` are set, **globs win**; with no globs, `report.sourceFilter`
is passed through untouched for full monocart control.

When you omit them, `report.entryFilter` defaults to "served from `localhost`" and
`report.sourcePath` to "repo-relative" (strips the absolute cwd prefix so Codecov can map paths).
Provide either in `report` to override.

## How it works

V8 JS coverage is available through Chromium's `page.coverage` API only, so the fixture is a
no-op on Firefox/WebKit. Each test's raw V8 dump is written to `rawDir` under a random filename;
`globalTeardown` reads them all back, feeds them to a single monocart `CoverageReport`, and emits
the lcov. Running coverage in its own (single-browser) pass keeps your normal cross-browser e2e
runs fast and uninstrumented.

## Why a separate fixture (vs `monocart-reporter`)?

[`monocart-reporter`](https://github.com/cenfun/monocart-reporter) is a full Playwright reporter
that can also collect coverage. This package is intentionally smaller: a single auto fixture plus
two global hooks, with no reporter to register and no opinion about how you report test results —
just raw V8 → lcov. Reach for the reporter if you want its richer reporting; reach for this if you
only want coverage.

## Uploading to Codecov in CI

Getting e2e coverage into [Codecov](https://about.codecov.io) is a **full pipeline** — collect,
emit lcov, then upload. Three things have to line up:

1. **Emit lcov with repo-relative paths.** Set `lcov: true` and an `outputDir` so the teardown
   writes `<outputDir>/lcov.info`. The default `sourcePath` (repo-relative) is what lets Codecov
   map each `SF:` entry back to a file in your repo — without it, absolute CI paths won't match and
   the flag silently shows no coverage.
2. **Run the instrumented pass in CI.** Coverage needs the source-mapped (preview/production) build
   and the gate flag — e.g. a script
   `"test:coverage:e2e": "cross-env E2E_COVERAGE=true playwright test --project=chromium"`.
3. **Upload the lcov under a flag.**

A GitHub Actions job — the steps that matter:

```yaml
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: pnpm/action-setup@v5
      - uses: actions/setup-node@v5
        with: { node-version-file: .nvmrc, cache: pnpm }
      - run: pnpm install --frozen-lockfile

      # Playwright needs its browser; coverage needs the built app.
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm build

      # E2E_COVERAGE=true → instruments Chromium and writes coverage/e2e/lcov.info
      - run: pnpm run test:coverage:e2e

      - name: Upload e2e coverage to Codecov
        uses: codecov/codecov-action@v7
        with:
          # Public repos upload tokenlessly — drop token line. Private repos need the secret.
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/e2e/lcov.info
          flags: e2e
          name: E2E
```

The token is **optional for public repositories** — Codecov accepts tokenless uploads through its
GitHub integration, so you can omit `token:` entirely. For a **private** repo, add `CODECOV_TOKEN`
as a repository secret. The `flags: e2e` keeps this report separate from your unit/browser
coverage. If the job is change-gated (doesn't run on every commit), add a matching
`flag_management` entry in `codecov.yml` with `carryforward: true` so the `e2e` flag keeps its last
value instead of dropping to "no report":

```yaml
# codecov.yml
flag_management:
  individual_flags:
    - name: e2e
      carryforward: true
```

## FAQ

**Does this slow down my normal e2e runs?**
No. Collection only happens when `enabled` is `true` (gate it on an env flag) and only on the
configured `browser` (Chromium). Your everyday cross-browser runs stay uninstrumented and fast.

**Why Chromium only?**
V8 JS coverage is exposed through Chromium's `page.coverage` API; Firefox and WebKit don't provide
it. The fixture is a no-op on those browsers, so a multi-browser run won't error — it just collects
nothing there.

**My report is empty or missing files — what should I check?**
Confirm `enabled` is `true`, that you ran the instrumented project (`--project=chromium`), that the
app is served from `localhost` (the default `entryFilter`), and that your `include` globs match the
**repo-relative** path (cwd-stripped, forward slashes) — `src/**`, not `/abs/.../src/**`.

**Why is coverage mapped back to my original `.ts`/`.tsx` and not the bundled chunks?**
Coverage is collected on the served JS chunks, then monocart unpacks each chunk through its
sourcemap to the original sources before `sourceFilter`/`sourcePath` apply. Serve a **source-mapped
build** so the mapping is accurate.

**Can I use a custom `sourceFilter` instead of globs?**
Yes. Set `report.sourceFilter` (a function or a monocart glob). With no `include`/`exclude` it's
used as-is; if you set both, the globs win.

**Why are both peers required?**
`@playwright/test` provides `test` and `page.coverage`; `monocart-coverage-reports` does the
V8 → lcov aggregation and source mapping. The package carries neither at runtime — you install and
version them.

## Release notes

Per-version notes for every published release live in
[`release-notes/`](https://github.com/soroush-tech/core/tree/main/packages/playwright-coverage/release-notes).
