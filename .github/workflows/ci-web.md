[← Workflows overview](./README.md)

# `ci-web.yml` — CI · Web

Called by [`ci.yml`](./ci.md), never triggered on its own. The web app's own shape: a build, three
coverage tiers in one V8 pass, and the tri-OS browser matrix.

```yaml
# ci:validates app__web
on: { workflow_call: … }
```

Editing this file re-runs the web app and nothing else — no packages, no workers, no editor.

## Inputs

`node_version`, `manager`, `command`, `runner`, `playwright_version`. Nothing is passed for
`VITE_BASE_URL`: repository and environment `vars` are available to a called workflow directly, and
the `web` job declares `environment: CI` itself.

## Job: `web`

ubuntu only. Builds with `SKIP_PRERENDER` for Codecov's bundle analysis, then runs the **merged**
`test:coverage:web` pass — unit + browser + storybook in one V8 pass — uploaded first as the
authoritative `web` flag that `.codecov.yml` gates patch on. The three per-tier runs follow for
their informational `unit` / `browser` / `storybook` flags; each uses `all: true`, so gating on them
directly would surface phantom-uncovered lines.

## Job: `e2e`

`needs: [web]`, so a failing web suite skips the engines rather than running three OSes to no
purpose. One Playwright engine per native platform — Chromium on ubuntu with coverage, Firefox on
windows, WebKit on macOS (≈10× cost, so WebKit only). Playwright's `webServer` builds and serves the
app, so there is no separate build step.

**`e2e` stays in this file, and stays off the `CI` environment.** It reads `vite_base_url` from
`web`'s outputs precisely so it needs no environment-scoped secret: joining the environment would
prompt a _second_ approval when it reaches the gate in its own post-`web` wave. Its Codecov upload
is tokenless (OIDC) for the same reason. Splitting these two jobs into separate files would break
that arrangement — `needs:` cannot cross workflow files.
