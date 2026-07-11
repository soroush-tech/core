---
description: GitHub Actions CI/CD conventions for this repo — the unified ci.yml (prepare → changes-gated lint/web/e2e/packages/worker → ci-ok), the action-pinning rule (first-party version tags, third-party SHAs), per-workspace Codecov flags with tokenless-OIDC to dodge the environment approval gate, Cloudflare deploys via cloudflare/wrangler-action, and the standalone Chromatic workflow. Use when adding, editing, or debugging any workflow under .github/workflows/.
paths: .github/workflows/**
---

# CI/CD (GitHub Actions)

Each workflow has a per-file deep-dive doc next to it (`ci.md`, `cd-*.md`, `chromatic.md`) with the full step-by-step — **read it before editing that workflow**. This skill is the rulebook, not a second copy of those docs.

## Workflow files

| File                | Name                     | Trigger                                                                      |
| ------------------- | ------------------------ | ---------------------------------------------------------------------------- |
| `ci.yml`            | `Continuous Integration` | `push` to `main`, all `pull_request`                                         |
| `cd-web.yml`        | Pages + Storybook deploy | `workflow_run` of CI (success, `main`) + dispatch                            |
| `cd-worker-api.yml` | Cloudflare Worker deploy | `workflow_run` of CI (success, `main`) + dispatch                            |
| `cd-packages.yml`   | Publish Packages (npm)   | manual `workflow_dispatch` only — see the `release-notes` skill              |
| `chromatic.yml`     | Chromatic                | `pull_request` + `push` to `main` + `workflow_dispatch` (main), non-blocking |
| `label-area.yml`    | Label Affected Area      | `issues: opened`                                                             |

One CI workflow for the whole monorepo; CD is separate and **gated on CI success** — never deploy on a raw `push`.

## Action pinning convention — the load-bearing rule

Pin every `uses:` by the action's **origin**. Getting this wrong fails review: CodeRabbit flags SHA-pinned first-party actions; SonarQube flags version-tagged third-party ones.

- **First-party `actions/*`** (checkout, setup-node, cache, upload-artifact, github-script) → **version tag**: `actions/checkout@v5`.
- **Third-party** (anything not under `actions/` — `pnpm/action-setup`, `codecov/codecov-action`, `cloudflare/wrangler-action`, `chromaui/action`, `dorny/paths-filter`) → **commit SHA** + `# vX` comment.

## CI job shape

`prepare` → `lint` → `web` / `e2e` / `packages` / `worker` → `ci-ok`.

- **Detect once in `prepare`** (node version from `.nvmrc`, package manager, runner, changed areas), reuse via `needs.prepare.outputs.*`. Never hard-code the node version.
- Heavy jobs are **change-gated** (`dorny/paths-filter`, no Nx/Turbo) so a package-only PR stays cheap. Wire dependency edges **manually**: a consumed package must appear in the consumer's filter (`web` ← `packages/**`, `worker` ← `packages/schema/**`). Include `pnpm-lock.yaml`, `.nvmrc`, and the workflow file in every filter so infra changes run everything.
- **`web` is ubuntu-only** (build + unit/browser/storybook coverage). **`e2e` is the only multi-OS matrix** (one Playwright engine per native OS; macOS ≈10× cost → WebKit only) and **`needs: web`**, so a `web` failure skips it instead of re-running three OSes.
- **`ci-ok`** is the single branch-protection check: `if: always()`, fails only on a needed job's `failure`/`cancelled` (change-gated skips pass). **Add every new job to its `needs`.**

## Coverage → Codecov

- Each workspace emits `coverage/lcov.info` and uploads under its **own flag** (`codecov/codecov-action`, SHA-pinned); register each area as a `.codecov.yml` component. Vitest configs set `reporter: ['text', 'lcov']`; 100% is enforced in `vitest.config` (`thresholds: { 100: true }`), Codecov is reporting only.
- The **`web` flag is the single merged `test:coverage` pass** — that's the patch gate. The per-tier `unit`/`browser`/`storybook` flags run `all: true` and stay **informational** (don't gate on them — phantom-uncovered lines). `e2e` is the chromium-only page-coverage flag.

## The `environment: CI` approval gate

`environment: CI` on `web`/`packages`/`worker` is a **required-reviewer gate**. One approval covers every job **already waiting** in that wave — but a job reaching the gate **later** (e.g. `e2e`, which `needs: web`) prompts a **second** approval. Keep such a job **off** the environment: `e2e` runs behind the already-gated `web` and uploads to Codecov **tokenlessly via OIDC** (`use_oidc: true` + job `permissions: { id-token: write }`, works on this public repo), so it needs neither the env-scoped `CODECOV_TOKEN` nor its own approval.

## Deploys

- **Gated on CI success**: `workflow_run` of CI + `workflow_dispatch`; a `changes` job re-derives what changed from CI's `changes.json` artifact (workflow_run carries no diff base). `concurrency: cancel-in-progress: false` — never abort an in-flight deploy.
- **Cloudflare deploys go through `cloudflare/wrangler-action` (SHA-pinned), not the wrangler CLI** — both the Worker (`command: deploy`) and Storybook Pages (`command: pages deploy`), with `apiToken`/`accountId` inputs. The worker's `wrangler.json` is generated **before** the action (`pnpm --filter @soroush/api config:gen`), since the action runs `wrangler deploy` directly and won't fire the package's `predeploy` hook.

## Chromatic

Visual review is its **own non-blocking workflow** (`chromatic.yml`), split out of CI so an exhausted plan can't block PR CI — **not** part of `ci-ok`. A `workflow_dispatch` is restricted to the main ref.

## Cost & speed defaults

- ubuntu only, except the `e2e` matrix. Set `timeout-minutes` on every job; matrices use `fail-fast: false`.
- CI concurrency cancels superseded runs (`group: ${{ github.workflow }}-${{ github.ref }}`); CD does not.
- Cache deps via `setup-node` `cache: pnpm`; cache Playwright binaries by `runner.os` + Playwright version.
- Tokens/keys → `secrets`; non-sensitive config → `vars`. Prefer OIDC over long-lived tokens.

If the task names a workflow file, read it and its `.md` and apply these rules.
