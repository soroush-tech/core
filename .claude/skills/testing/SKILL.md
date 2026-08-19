---
description: How this project runs tests and coverage - the three test tiers and their placement, the vitest projects, the test:coverage:* commands, where coverage output lands (coverage/lcov.info), the Codecov/CI file, and the `pnpm coverage:check` gate. Use when running tests or coverage, checking per-file coverage, or verifying 100% on touched files.
---

## Test tiers (all co-located next to source)

| Tier        | File suffix            | Runner            | Notes                                               |
| ----------- | ---------------------- | ----------------- | --------------------------------------------------- |
| Unit        | `*.test.ts(x)`         | vitest            | jsdom; wrap renders in `renderWithTheme`            |
| Integration | `*.spec.ts(x)`         | vitest            | same `unit` project as unit tests                   |
| Browser     | `*.browser.test.ts(x)` | vitest (Chromium) | only for code jsdom can't run (real layout/pointer) |
| E2E         | `*.e2e.ts`             | Playwright        | next to its page; shared infra in `src/test/e2e/`   |

`src/pages/` is **not** unit tested (e2e-only) and is excluded from the unit coverage target.

## Vitest projects (`vitest.config.ts`)

- `unit` - jsdom, runs `**/*.{test,spec}.*` (excludes `*.browser.test.*`)
- `unit-browser` - headless Chromium, runs only `*.browser.test.*`
- `storybook` - runs `*.stories.tsx` via the Storybook addon

Scope a run with `--project=unit` (etc.) and pass path filters: `vitest run --project=unit src/section/Article`.

## Coverage commands (`package.json`)

| Command                        | Runs                                       |
| ------------------------------ | ------------------------------------------ |
| `pnpm test:coverage`           | every workspace, recursively               |
| `pnpm test:coverage:web`       | the web app alone, all its vitest projects |
| `pnpm test:coverage:unit`      | `unit` project - **this is what CI runs**  |
| `pnpm test:coverage:browser`   | `unit-browser` project                     |
| `pnpm test:coverage:storybook` | `storybook` project                        |
| `pnpm test:coverage:e2e`       | Playwright (`E2E_COVERAGE=true`)           |
| `pnpm test:coverage:ui`        | unit coverage, then opens the HTML report  |

Unsuffixed commands mean the web app. The editor app has its own, since its suites
must be addressable without dragging the web app's along:

| Command                          | Runs                                     |
| -------------------------------- | ---------------------------------------- |
| `pnpm test:coverage:editor`      | editor unit tier (jsdom vitest)          |
| `pnpm test:e2e:editor`           | editor e2e tier (Playwright-Electron)    |
| `pnpm test:coverage:e2e:editor`  | the same, with coverage                  |
| `pnpm coverage:check:e2e:editor` | per-file gate over the editor's e2e lcov |

## Where coverage output lands

Default `reportsDirectory` is **`coverage/`** at repo root (reporters: `text` + `lcov`):

- `coverage/lcov.info` - machine-readable report. **The file CI uploads to Codecov** (`.github/workflows/ci.yml`) and the file `pnpm coverage:check` parses.
- `coverage/lcov-report/index.html` - browsable HTML report (`test:coverage:ui` opens it).
- `text` reporter prints to stdout - no file.
- **E2E exception:** writes to `coverage/e2e/lcov.info`.

All vitest projects write to the **same** `coverage/lcov.info` - each run overwrites the last, so the file reflects whatever you ran most recently. `coverage/` is gitignored.

## Per-file coverage gate: `pnpm coverage:check`

`scripts/coverage-check.ts` parses `coverage/lcov.info` and exits non-zero if any matched file is below threshold. Target is **100% on touched files** (CLAUDE.md guideline 6).

```bash
pnpm test:coverage:unit                              # 1. generate coverage first (as CI does)
pnpm coverage:check src/section/Article src/common   # 2. check files matching these path filters
pnpm coverage:check                                  # no filters → every file in the report
pnpm coverage:check --threshold=90 src/common        # custom threshold (default 100)
pnpm coverage:check --file=coverage/e2e/lcov.info    # parse the e2e report instead
```

It reports only what the **last** coverage run generated - a file whose tests didn't run shows 0%. So generate coverage with the relevant tests (full `test:coverage:unit`, or scoped to the touched tests) before checking.
