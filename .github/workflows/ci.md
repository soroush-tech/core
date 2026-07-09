[← Workflows overview](./README.md)

# `ci.yml` — Continuous Integration

Single CI workflow for the whole monorepo. A `prepare` job detects everything once,
then change-gated jobs fan out from it. `ci-ok` is the single status check used for
branch protection.

```yaml
on:
  push: { branches: [main] }
  pull_request:
permissions: { contents: read }
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true # supersede stale runs on the same ref
```

| Field       | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Triggers    | `push` to `main`, every `pull_request`                         |
| Permissions | `contents: read` (least privilege; jobs that need more opt in) |
| Concurrency | one run per `workflow + ref`; in-progress runs are cancelled   |

---

## Job graph

```mermaid
flowchart TD
    prepare --> lint
    lint --> packages
    lint --> worker
    lint --> web
    prepare --> packages
    prepare --> worker
    prepare --> web
    prepare --> ciok["ci-ok"]
    lint --> ciok
    packages --> ciok
    worker --> ciok
    web --> ciok
```

`packages`, `worker`, and `web` only run when their area changed (see
[`prepare`](#job-prepare)). `ci-ok` runs `if: always()` so it can turn skips into a
pass and real failures into a fail.

---

## Job: `prepare`

`runs-on: ubuntu-latest` · `timeout-minutes: 15`. Produces every output the other
jobs consume via `needs.prepare.outputs.*`.

| #   | Step                        | Run / Action                                                                                                           | What it does                                                                                                                                                                                                                               |
| --- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Checkout Repository         | `actions/checkout@v5` (`persist-credentials: false`)                                                                   | Clone the repo without leaving the token on disk.                                                                                                                                                                                          |
| 2   | Read Node.js version        | `cat .nvmrc` → `$GITHUB_OUTPUT`                                                                                        | Single source of truth for the Node version; never hard-coded.                                                                                                                                                                             |
| 3   | Detect package manager      | shell `if` on lockfile presence                                                                                        | Emits `manager` (`pnpm`/`yarn`/`npm`), `command` (e.g. `install --frozen-lockfile`), `runner`. Fails if none found.                                                                                                                        |
| 4   | Read Playwright version     | `node -p "...devDependencies?.['@playwright/test'] \|\| ...dependencies?.['@playwright/test']"` then strip leading `^` | Feeds the Playwright binary cache key. **Must read `@playwright/test`** — the project has no bare `playwright` dep, so reading `playwright` yields the string `"undefined"` and freezes the cache key (see [Caching](#caching)).           |
| 5   | Discover workspace entities | inline `node` script over `apps/*`, `workers/*`, `packages/*`, `.github/workflows/*`                                   | Builds a per-entity `paths-filter` config: one key per app (`app__<name>`), worker (`worker__<name>`), package (`pkg__<name>`), and workflow file (`wf__<name>`), plus `root` (`['*', '.*']`, top-level files only).                       |
| 6   | Detect changed entities     | `dorny/paths-filter@v4`                                                                                                | Consumes the generated `filters` (JSON is valid YAML) and outputs a `changes` list of the keys that matched.                                                                                                                               |
| 7   | Assemble `changes.json`     | inline `node` script                                                                                                   | Writes [`changes.json`](#changesjson) (the lists + `root`), and derives this run's own gating outputs `web` / `worker` / `has_packages` / `changed_packages`. A `root` or workflow change counts as infra → validates the whole workspace. |
| 8   | Upload `changes.json`       | `actions/upload-artifact@v7` (name `changes`)                                                                          | Hands the single file to the CD workflows, which run on `workflow_run` and have no diff base of their own.                                                                                                                                 |

### Outputs

| Output                           | Meaning                                                                           |
| -------------------------------- | --------------------------------------------------------------------------------- |
| `node_version`                   | from `.nvmrc`                                                                     |
| `manager` / `command` / `runner` | package-manager triple                                                            |
| `playwright_version`             | `@playwright/test` semver (cache key input)                                       |
| `web` / `worker`                 | `'true'` when that area, a dep it bundles, or infra changed                       |
| `has_packages`                   | `'true'` when ≥1 package (or infra) changed                                       |
| `changed_packages`               | `fromJSON`-ready matrix `{include:[{dir,filter,flag}]}` for the CI `packages` job |

### `changes.json`

The single artifact the CD workflows consume. `apps` / `worker` / `packages` /
`workflows` are **lists of the changed names** (empty when nothing changed); `root`
is a **boolean** (a top-level file changed). No `dir`/`filter`/`flag` — a name is
enough; each CD applies its own [condition](./cd-web.md#job-changes).

```json
{
  "apps": ["web"],
  "worker": ["api"],
  "packages": ["schema", "eslint-config"],
  "workflows": ["ci", "cd-web"],
  "root": false
}
```

---

## Job: `lint`

`needs: prepare` · ubuntu · 15 min. Lint + typecheck the whole workspace once
(`pnpm -r` skips workspaces without the script). Not change-gated — it's cheap.

| #   | Step       | Detail                                                                                                               |
| --- | ---------- | -------------------------------------------------------------------------------------------------------------------- |
| 1   | Checkout   | `actions/checkout@v5`, no persisted creds                                                                            |
| 2   | Setup pnpm | `pnpm/action-setup@v5`, only `if manager == 'pnpm'`                                                                  |
| 3   | Setup Node | `actions/setup-node@v5` with `node-version: <prepare>` and `cache: <manager>` (deps cache — see [Caching](#caching)) |
| 4   | Install    | `${manager} ${command}` with `CI: true`                                                                              |
| 5   | Lint       | `${runner} run lint` (`--max-warnings 0`)                                                                            |
| 6   | Typecheck  | `${runner} run typecheck`                                                                                            |

---

## Job: `packages`

`needs: [prepare, lint]` · `if: has_packages == 'true'` · `environment: CI` · ubuntu ·
15 min. Runs once per changed package via the matrix.

```yaml
strategy:
  fail-fast: false # one package failing doesn't cancel the others
  matrix: ${{ fromJSON(needs.prepare.outputs.changed_packages) }}
```

| #   | Step                                                      | Detail                                                                                                             |
| --- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 1–4 | Checkout · Setup pnpm · Setup Node (deps cache) · Install | same shape as `lint`                                                                                               |
| 5   | Tests with coverage                                       | `${runner} --filter ${{ matrix.filter }} test:coverage`                                                            |
| 6   | Upload to Codecov                                         | `codecov/codecov-action@v7`, `files: ./packages/${{ matrix.dir }}/coverage/lcov.info`, `flags: ${{ matrix.flag }}` |

---

## Job: `worker`

`needs: [prepare, lint]` · `if: worker == 'true'` · `environment: CI` · ubuntu · 15 min.

| #   | Step                                                      | Detail                                                               |
| --- | --------------------------------------------------------- | -------------------------------------------------------------------- |
| 1–4 | Checkout · Setup pnpm · Setup Node (deps cache) · Install | same shape as `lint`                                                 |
| 5   | Tests with coverage                                       | `${runner} --filter @soroush/api test:coverage`                      |
| 6   | Upload to Codecov                                         | `files: ./workers/api/coverage/lcov.info`, `flags: api`, `name: api` |

---

## Job: `web`

`needs: [prepare, lint]` · `if: web == 'true'` · `environment: CI` · 30 min. The only
multi-OS job.

```yaml
runs-on: ${{ matrix.os }}
strategy:
  matrix: { os: [ubuntu-latest, windows-latest, macOS-latest] }
env:
  PLAYWRIGHT_BROWSERS_PATH: ${{ github.workspace }}/ms-playwright
```

`PLAYWRIGHT_BROWSERS_PATH` is pinned so one cache path/key works on every OS (the
default download location differs per platform).

| #   | Step                              | Runs on                     | Detail                                                                                                                                                                                                                                                                  |
| --- | --------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Checkout                          | all                         | `fetch-depth: 0` (full history; Chromatic's `onlyChanged` needs it), no persisted creds                                                                                                                                                                                 |
| 2   | Setup pnpm                        | all                         | `if manager == 'pnpm'`                                                                                                                                                                                                                                                  |
| 3   | Setup Node                        | all                         | deps cache via `cache: <manager>`                                                                                                                                                                                                                                       |
| 4   | **Restore Playwright cache**      | all                         | `actions/cache/restore@v5`, id `playwright-cache`, path `ms-playwright`, key `${{ runner.os }}-playwright-${{ needs.prepare.outputs.playwright_version }}`                                                                                                              |
| 5   | Install                           | all                         | `${manager} ${command}`, `CI: true`                                                                                                                                                                                                                                     |
| 6   | Install Playwright browsers       | cache miss                  | `if: cache-hit != 'true'` → `pnpm --filter @soroush/web exec playwright install --with-deps` (downloads binaries + Linux system deps)                                                                                                                                   |
| 7   | Install Playwright system deps    | cache hit, Linux            | `if: cache-hit == 'true' && runner.os == 'Linux'` → `playwright install-deps` (apt libs only, no binary download; browsers came from the cache)                                                                                                                         |
| 8   | **Save Playwright cache**         | all                         | `actions/cache/save@v5`, `if: always() && steps.playwright-cache.outputs.cache-hit != 'true'`, same key                                                                                                                                                                 |
| 9   | Build project                     | ubuntu                      | `${runner} run build` with `SKIP_PRERENDER: 'true'`                                                                                                                                                                                                                     |
| 10  | Run Test                          | all                         | `${runner} --filter @soroush/web test` (the non-coverage unit/component run on every OS)                                                                                                                                                                                |
| 11  | Publish to Chromatic              | ubuntu, not `renovate[bot]` | `chromaui/action@latest`, `buildScriptName: build:storybook`, `onlyChanged: true`, `exitZeroOnChanges: true`; exposes `storybookUrl` — runs first so the `web` upload precedes the per-tier flags                                                                       |
| 12  | Web coverage (merged) → Codecov   | ubuntu                      | `test:coverage` (unit + browser + storybook in one V8 pass) with `SB_URL` → upload `flags: web`; `.codecov.yml` gates patch on it. **Uploaded first** so the Codecov PR comment renders from this authoritative report, not the per-tier flags' phantom-uncovered lines |
| 13  | Unit coverage → Codecov           | ubuntu                      | `test:coverage:unit` → upload `flags: unit` (informational)                                                                                                                                                                                                             |
| 14  | Browser coverage → Codecov        | ubuntu                      | `test:coverage:browser` → upload `flags: browser` (informational)                                                                                                                                                                                                       |
| 15  | Storybook coverage → Codecov      | ubuntu                      | `test:coverage:storybook` with `SB_URL: <chromatic url>` → upload `flags: storybook` (informational)                                                                                                                                                                    |
| 16  | E2E (Chromium) coverage → Codecov | ubuntu                      | `test:coverage:e2e` → upload `files: ./apps/web/coverage/e2e/lcov.info`, `flags: e2e`                                                                                                                                                                                   |
| 17  | E2E Firefox                       | windows                     | `test:e2e:firefox`                                                                                                                                                                                                                                                      |
| 18  | E2E WebKit                        | macOS                       | `test:e2e:webkit`                                                                                                                                                                                                                                                       |

Each engine runs on its native OS; macOS (≈10× cost) is reserved for WebKit. E2E
runs read `VITE_BASE_URL` from repo `vars`.

---

## Job: `ci-ok`

`if: always()` · `needs: [prepare, lint, packages, worker, web]` · ubuntu · 5 min.
The single required check for branch protection.

```yaml
- if: contains(needs.*.result, 'failure') || contains(needs.*.result, 'cancelled')
  run: exit 1
```

Skipped change-gated jobs report `skipped` (not `failure`/`cancelled`), so a
package-only PR still passes `ci-ok` without the web suite ever running.

---

## Caching

Two independent caches; both are keyed so a real change busts them.

### 1. Dependency store (`actions/setup-node`)

Every job that installs uses `setup-node@v5` with `cache: ${{ … manager }}`. For
pnpm this caches the **pnpm store**, keyed automatically off the `pnpm-lock.yaml`
hash. A lockfile change → new key → fresh install; otherwise the store is restored
and `--frozen-lockfile` just links.

### 2. Playwright browser binaries (`web` job only)

```yaml
env:
  PLAYWRIGHT_BROWSERS_PATH: ${{ github.workspace }}/ms-playwright
# restore (before install)
- uses: actions/cache/restore@v5
  id: playwright-cache
  with:
    path: ${{ github.workspace }}/ms-playwright
    key: ${{ runner.os }}-playwright-${{ needs.prepare.outputs.playwright_version }}
# … install deps, then on a miss `playwright install --with-deps`,
#   on a hit `playwright install-deps` (Linux only) …
# save (only on a miss, even if later steps fail)
- uses: actions/cache/save@v5
  if: always() && steps.playwright-cache.outputs.cache-hit != 'true'
  with:
    path: ${{ github.workspace }}/ms-playwright
    key: ${{ runner.os }}-playwright-${{ needs.prepare.outputs.playwright_version }}
```

Why the **restore/save split** instead of a single `actions/cache`:

- The download is guarded on the cache result: on a **miss**, `playwright install
--with-deps` fetches the browser binaries (and Linux system deps); on a **hit**, the
  binaries are already restored, so we run only `playwright install-deps` on Linux
  (apt libs live outside the cache) and skip installation entirely on Windows/macOS.
- `save` runs only on a miss (`cache-hit != 'true'`) and with `if: always()`, so a
  freshly downloaded set is persisted even if a later test step fails.

**Key correctness:** the key embeds `playwright_version`. That value comes from
`prepare` reading `@playwright/test` — the package actually in `apps/web/package.json`.
Reading a bare `playwright` (absent) returns `"undefined"`, which pins the key to
`<os>-playwright-undefined` forever: after the first save it always hits, so a
Playwright upgrade silently reuses stale browser binaries. Keying on the real version
makes an upgrade produce a new key and a fresh download.

---

See also: [cd-web.md](./cd-web.md), [cd-worker-api.md](./cd-worker-api.md), and the
[overview README](./README.md).
