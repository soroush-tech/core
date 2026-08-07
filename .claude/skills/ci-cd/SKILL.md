---
description: GitHub Actions CI/CD conventions for this repo — the CI entry workflow calling one workflow per area (prepare → lint → packages/worker/app → ci-ok, with app → web/editor), the action-pinning rule (version tags for `actions/*`, commit SHAs for everything else including our own org), per-workspace Codecov flags with tokenless-OIDC uploads, the CI-environment approval gate (with env-scoped vars forwarded to environment-less jobs via job outputs), Cloudflare deploys via cloudflare/wrangler-action, and the standalone Chromatic workflow. Use when adding, editing, or debugging any workflow under .github/workflows/.
paths: .github/workflows/**
---

# CI/CD (GitHub Actions)

Each workflow has a per-file deep-dive doc next to it (`ci.md`, `cd-*.md`, `chromatic.md`) with the full step-by-step — **read it before editing that workflow**. This skill is the rulebook, not a second copy of those docs.

## Workflow files

| File                | Name                     | Trigger                                                                      |
| ------------------- | ------------------------ | ---------------------------------------------------------------------------- |
| `ci.yml`            | `Continuous Integration` | `push` to `main`, all `pull_request`                                         |
| `ci-packages.yml`   | CI · Packages            | `workflow_call` from `ci.yml`                                                |
| `ci-worker.yml`     | CI · Workers             | `workflow_call` from `ci.yml`                                                |
| `ci-app.yml`        | CI · Apps                | `workflow_call` from `ci.yml`                                                |
| `ci-web.yml`        | CI · Web                 | `workflow_call` from `ci-app.yml`                                            |
| `ci-editor.yml`     | CI · Editor              | `workflow_call` from `ci-app.yml`                                            |
| `cd-web.yml`        | Pages + Storybook deploy | `workflow_run` of CI (success, `main`) + dispatch                            |
| `cd-worker-api.yml` | Cloudflare Worker deploy | `workflow_run` of CI (success, `main`) + dispatch                            |
| `cd-packages.yml`   | Publish Packages (npm)   | manual `workflow_dispatch` only — see the `release-notes` skill              |
| `cd-editor.yml`     | CD · Editor              | manual `workflow_dispatch` only — draft GitHub Release of the installers     |
| `chromatic.yml`     | Chromatic                | `pull_request` + `push` to `main` + `workflow_dispatch` (main), non-blocking |
| `label-area.yml`    | Label Affected Area      | `issues: opened`                                                             |

One CI entry workflow calling one per area; CD is separate and **gated on CI success** — never deploy on a raw `push`.

## Action pinning convention — the load-bearing rule

Pin every `uses:` by the action's **origin**. Getting this wrong fails review: CodeRabbit flags SHA-pinned `actions/*`; SonarQube flags anything else on a version tag.

- **GitHub's own** — `actions/*` (checkout, setup-node, cache, upload-artifact, github-script) → **version tag**: `actions/checkout@v5`.
- **Everything else, our own org included** (`soroush-tech/bench-action`, `pnpm/action-setup`, `codecov/codecov-action`, `cloudflare/wrangler-action`, `chromaui/action`, `dorny/paths-filter`) → **commit SHA** + `# vX` comment.

Own-org used to sit with `actions/*` on a tag. It does not any more: what SHA-pinning defends against is a tag being moved, and our own tags move like anyone's. The SHA is bumped when the action releases, which is the point — the upgrade is a reviewed line, not a silent one.

## CI job shape

`prepare` → `lint` → three **caller jobs** (`packages`, `worker`, `app`) → `ci-ok`. Each caller `uses:` an area workflow; `ci-app.yml` calls one workflow per app in turn, so adding an app never touches the entry file. Nesting is three of the four levels GitHub allows, and it stays one run with one `ci-ok`.

- **Detect once in `prepare`** (node version from `.nvmrc`, package manager, runner, changed areas), reuse via `needs.prepare.outputs.*`. Never hard-code the node version.
- **A file per area, so the gate can be narrower than everything.** Each workflow declares its scope on line 1 (`# ci:validates pkg__*`), read by `scripts/assemble-changes.mjs`; unmarked or unparseable means the whole workspace. A caller job cannot set `environment:`/`timeout-minutes:`/`runs-on:` (those belong to the inner jobs), and **`secrets: inherit` is mandatory, per hop** — naming an environment-scoped secret at the call site passes an empty string, and a middle layer that omits it starves the workflow below.
- **One job per shape, not per member.** Packages, workers and the editor's unit tier are the same job — install, `test:coverage`, upload the lcov — so packages are one matrix and workers another, both built from the tree in `scripts/assemble-changes.mjs`. **Adding a workspace member must need no edit to `ci.yml`**: if a new area needs a job, ask first whether it is really a different shape (`web` builds; `editor-e2e` drives Electron) or just another row.
- Heavy jobs are **change-gated** (`dorny/paths-filter`, no Nx/Turbo) so a package-only PR stays cheap. Dependency edges are **derived, never listed**: a member runs when it changed or when a package it declares as a `workspace:` dependency changed. Do not add a hand-written consumer list — it is a list to forget the day a dependency moves.
- **A workflow file validates what it runs**, and says so itself on line 1. `ci.yml` is `all`; a `cd-*`, Chromatic or the labeller is `nothing`, because CI never executes them. Same for `labs/*`, which has no job at all. The marker line takes tokens only — prose on the line below, or a stray `nothing` in it silently narrows the file to zero.
- **`web` is ubuntu-only** (build + unit/browser/storybook coverage). **`e2e` is the only multi-OS matrix** (one Playwright engine per native OS; macOS ≈10× cost → WebKit only) and **`needs: web`**, so a `web` failure skips it instead of re-running three OSes.
- **`ci-ok`** is the single branch-protection check: `if: always()`, fails only on a needed job's `failure`/`cancelled` (change-gated skips pass). **Add every new job to its `needs`.**

## Coverage → Codecov

- Each workspace emits `coverage/lcov.info` and uploads under its **own flag** (`codecov/codecov-action`, SHA-pinned); register each area as a `.codecov.yml` component. Vitest configs set `reporter: ['text', 'lcov']`; 100% is enforced in `vitest.config` (`thresholds: { 100: true }`), Codecov is reporting only.
- The **`web` flag is the single merged `test:coverage` pass** — that's the patch gate. The per-tier `unit`/`browser`/`storybook` flags run `all: true` and stay **informational** (don't gate on them — phantom-uncovered lines). `e2e` is the chromium-only page-coverage flag.
- A matrix row's flag is the **unscoped package name**, not its directory: two members are called `bench`, and their flags are `bench` (the package) and `bench-api` (the worker). The editor splits the same way as the web app: `editor` for the unit tier, `editor-e2e` for the Electron run.

## The `environment: CI` approval gate

`environment: CI` on `web`/`packages`/`worker` is a **required-reviewer gate**. One approval covers every job **already waiting** in that wave — but a job reaching the gate **later** (e.g. `e2e`, which `needs: web`) prompts a **second** approval. Keep such a job **off** the environment. When it still needs an env-scoped value, **forward it through an already-gated job's `outputs`** rather than joining the environment: `e2e` needs the CI-environment-scoped `VITE_BASE_URL` (its dev-server SSR fetch needs an absolute base — else the relative `/gists/:id` URL throws in Node and the article-page e2e fails on a placeholder title), so `web` reads it (`outputs.vite_base_url: ${{ vars.VITE_BASE_URL }}`) and `e2e` consumes `needs.web.outputs.vite_base_url`. Only works for **non-secret** values (job outputs redact secrets). e2e also uploads to Codecov **tokenlessly via OIDC** (`use_oidc: true` + job `permissions: { id-token: write }`, works on this public repo), so its coverage upload doesn't depend on the env-scoped `CODECOV_TOKEN` either.

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
