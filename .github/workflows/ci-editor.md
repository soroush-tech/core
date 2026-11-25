[← Workflows overview](./README.md)

# `ci-editor.yml` - CI · Editor

Called by [`ci-app.yml`](./ci-app.md), never triggered on its own. The desktop editor's two
tiers: the unit suite (jsdom, plus the App suite in headless Chromium) and the Playwright-Electron
e2e.

```yaml
# ci:validates app__editor
on: { workflow_call: ... }
```

Editing this file re-runs the editor and nothing else.

## Inputs

`node_version`, `manager`, `command`, `runner`, `playwright_version` - the last keys the `unit`
job's Chromium cache. No `secrets: inherit`: both uploads are tokenless.

## Jobs: `unit` and `e2e`

Two jobs, the same shape as the web app's `web` and `e2e`. They run **in parallel**: the editor's
e2e is a single job, so there is nothing to save by holding it behind the unit suite the way the web
app holds three operating systems behind its own.

Both check out, set up pnpm and Node, restore `~/.cache/electron` - keyed on
`hashFiles('apps/editor/package.json')`, since the binary lives outside the pnpm store - and
install. The shared install command runs `--ignore-scripts`, which also skips Electron's
postinstall, so both jobs follow it with `rebuild electron` - the one lifecycle script CI needs,
run explicitly: it downloads into the restored cache and unpacks into
`node_modules/electron/dist`. Then:

| Job    | Runs                                                                         | Flag         |
| ------ | ---------------------------------------------------------------------------- | ------------ |
| `unit` | Chromium (cached by `playwright_version`), then `test:coverage:editor`       | `editor`     |
| `e2e`  | `playwright install-deps chromium` + `xvfb`, then `test:coverage:e2e:editor` | `editor-e2e` |

Each prefixes its lcov paths with `apps/editor/` before uploading, so Codecov maps them by exact
path rather than guessing which `src/` in the monorepo they belong to.

Three things this file is careful about:

- **Two jobs, two workspaces.** Vitest's `coverage.clean` wipes `apps/editor/coverage/`, and the e2e
  report lives at `coverage/e2e/` inside it. In one job the steps had to be ordered so the e2e run
  did not delete its own lcov; separate jobs settle that by construction.
- **A browser download in `unit` only.** The `unit-browser` project (`*.browser.test.*`, the App
  suite) runs in Playwright's headless Chromium, cached under `ms-playwright` like the web app's.
  `e2e` downloads no browser: Electron bundles its own Chromium, and `install-deps` fetches only
  the shared libraries it links against. `xvfb` supplies the display the runner does not have.
- **No `environment: CI`.** Both uploads go through OIDC, so neither job needs an environment-scoped
  secret, and neither can add a second approval prompt to a run whose gated jobs are already
  waiting.

If Electron ever dies on a sandbox or `clone` error (AppArmor restricting unprivileged user
namespaces on newer ubuntu images), the fix is `sysctl kernel.apparmor_restrict_unprivileged_userns=0`
in the step, not `--no-sandbox` in `fixtures.ts` - that would change what the suite tests for
everyone.
