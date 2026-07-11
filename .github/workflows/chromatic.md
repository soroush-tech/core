[← Workflows overview](./README.md)

# `chromatic.yml` — Chromatic

Publishes Storybook to [Chromatic](https://www.chromatic.com) for visual review, in its own
workflow (**split out of `ci.yml`'s `web` job**) so a Chromatic failure — most often an
exhausted plan/quota — can never block PR CI: nothing gates on its result, so a red run here is
visible but **non-blocking** (it's not part of the `ci-ok` branch-protection check). It runs on
**pull requests to `main`** (visual review before merge) and on **pushes to `main`** (baseline
refresh).

```yaml
on:
  push:
    branches: [main]
    paths: [apps/web/**, packages/**, pnpm-lock.yaml, .nvmrc, .github/workflows/chromatic.yml]
  pull_request:
    branches: [main]
    paths: [apps/web/**, packages/**, pnpm-lock.yaml, .nvmrc, .github/workflows/chromatic.yml]
  workflow_dispatch:
concurrency:
  group: chromatic-${{ github.ref }}
  cancel-in-progress: true
```

| Field       | Value                                                                           |
| ----------- | ------------------------------------------------------------------------------- |
| Triggers    | `pull_request` + `push` to `main` (paths-filtered) + manual `workflow_dispatch` |
| Runs on     | `ubuntu-latest`, `environment: CI` (for `CHROMATIC_PROJECT_TOKEN`)              |
| Blocking?   | No — not part of `ci-ok`, so a failure never blocks a merge                     |
| Concurrency | one run per ref; a newer push cancels an in-flight run                          |

## Steps

| #   | Step                 | Detail                                                                                                                                                                                                                  |
| --- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Checkout             | `actions/checkout@v5`, `fetch-depth: 0` (full history — Chromatic's `onlyChanged` needs it), no persisted creds                                                                                                         |
| 2   | Setup pnpm           | `pnpm/action-setup@v5`                                                                                                                                                                                                  |
| 3   | Setup Node           | `actions/setup-node@v5`, `node-version-file: .nvmrc`, `cache: pnpm`                                                                                                                                                     |
| 4   | Install              | `pnpm install --frozen-lockfile`                                                                                                                                                                                        |
| 5   | Publish to Chromatic | `chromaui/action@v17.7.1` with `buildScriptName: build:storybook`, `storybookBaseDir: apps/web`, `onlyChanged: true`, `exitZeroOnChanges: true`. The action builds Storybook itself, so there's no separate build step. |

## Why a separate workflow, and what changed in CI

The Chromatic step used to live in CI's `web` job and, having no `continue-on-error`, its
failure failed the job → failed `ci-ok` → **blocked the PR**. With the plan exhausted that was
constant. Pulling it into this standalone, non-blocking workflow keeps visual review on PRs (and
refreshes the `main` baseline on merge) without any of it gating `ci-ok`. A `workflow_dispatch`
is still restricted to the `main` ref (`if: github.event_name != 'workflow_dispatch' ||
github.ref == 'refs/heads/main'`) so a branch dispatch can't publish with the token.

That step also exposed a `storybookUrl` output that CI fed to the Storybook coverage tiers as
`SB_URL`. That coupling is gone: `apps/web/vitest.config.ts` only sets `storybookUrl` **when
`SB_URL` is present**, so with it unset the Storybook test provider self-hosts from `.storybook`
— CI's Storybook coverage is unaffected.

## Requirements

- **`CHROMATIC_PROJECT_TOKEN`** in the `CI` environment (same place CI read it). The job sets
  `environment: CI` so the token resolves the way it always has — which also means a **PR run
  waits on the `CI` environment's approval**, separate from `ci.yml`'s. Chromatic can't use OIDC,
  so the token must be present; if it's a repo-level secret rather than environment-scoped, drop
  `environment: CI` to skip that approval.
- Fork PRs run without secrets (GitHub withholds them from `pull_request` on forks), so the
  Chromatic upload there is skipped/fails harmlessly — no token leak.
- The plan/quota must have capacity for a build to succeed; when it doesn't, the run goes red and
  resumes on the next push once capacity returns.

---

See also: [ci.md](./ci.md), [cd-web.md](./cd-web.md), and the [overview README](./README.md).
