[← Workflows overview](./README.md)

# `chromatic.yml` — Chromatic

Publishes Storybook to [Chromatic](https://www.chromatic.com) for visual review. It was
**split out of CI** (`ci.yml`'s `web` job) and scoped to **`main` only** so a Chromatic
failure — most often an exhausted plan/quota — can never block pull-request CI. Nothing gates
on its result: a red run here is visible but **non-blocking** (it's not part of the `ci-ok`
branch-protection check).

```yaml
on:
  push:
    branches: [main]
    paths: [apps/web/**, packages/**, .github/workflows/chromatic.yml]
  workflow_dispatch:
concurrency:
  group: chromatic-${{ github.ref }}
  cancel-in-progress: true
```

| Field       | Value                                                              |
| ----------- | ------------------------------------------------------------------ |
| Triggers    | `push` to `main` (paths-filtered) + manual `workflow_dispatch`     |
| Runs on     | `ubuntu-latest`, `environment: CI` (for `CHROMATIC_PROJECT_TOKEN`) |
| Blocking?   | No — never runs on a `pull_request`, and no check depends on it    |
| Concurrency | one run per ref; a newer push cancels an in-flight run             |

## Steps

| #   | Step                 | Detail                                                                                                                                                                                                                  |
| --- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Checkout             | `actions/checkout@v5`, `fetch-depth: 0` (full history — Chromatic's `onlyChanged` needs it), no persisted creds                                                                                                         |
| 2   | Setup pnpm           | `pnpm/action-setup@v5`                                                                                                                                                                                                  |
| 3   | Setup Node           | `actions/setup-node@v5`, `node-version-file: .nvmrc`, `cache: pnpm`                                                                                                                                                     |
| 4   | Install              | `pnpm install --frozen-lockfile`                                                                                                                                                                                        |
| 5   | Publish to Chromatic | `chromaui/action@v17.7.1` with `buildScriptName: build:storybook`, `storybookBaseDir: apps/web`, `onlyChanged: true`, `exitZeroOnChanges: true`. The action builds Storybook itself, so there's no separate build step. |

## Why main-only, and what changed in CI

The Chromatic step used to live in CI's `web` job and, having no `continue-on-error`, its
failure failed the job → failed `ci-ok` → **blocked the PR**. With the plan exhausted that was
constant. Moving it to a `push`-to-`main` workflow removes it from the PR path entirely.

That step also exposed a `storybookUrl` output that CI fed to the Storybook coverage tiers as
`SB_URL`. That coupling is gone: `apps/web/vitest.config.ts` only sets `storybookUrl` **when
`SB_URL` is present**, so with it unset the Storybook test provider self-hosts from `.storybook`
— CI's Storybook coverage is unaffected.

## Requirements

- **`CHROMATIC_PROJECT_TOKEN`** in the `CI` environment (same place CI read it). The job sets
  `environment: CI` so the token resolves the way it always has.
- The plan/quota must have capacity for a build to succeed; when it doesn't, the run goes red
  on `main` and simply resumes on the next push once capacity returns.

---

See also: [ci.md](./ci.md), [cd-web.md](./cd-web.md), and the [overview README](./README.md).
