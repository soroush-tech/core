[← Workflows overview](./README.md)

# `ci-packages.yml` — CI · Packages

Called by [`ci.yml`](./ci.md), never triggered on its own. Holds the package matrix and the
performance gate.

```yaml
# ci:validates pkg__*
on: { workflow_call: … }
```

The marker on line 1 is what makes editing this file cheap: it re-runs the packages this workflow
holds and nothing else — not the web app, not the workers, not the editor. See
[what a workflow validates](./ci.md#what-a-workflow-validates).

## Inputs

| Input                            | From `prepare`                                             |
| -------------------------------- | ---------------------------------------------------------- |
| `node_version`                   | `.nvmrc`                                                   |
| `manager` / `command` / `runner` | the package-manager triple                                 |
| `playwright_version`             | the browser-cache key for rows with a real-browser tier    |
| `changed_packages`               | `{include:[{area,dir,filter,flag,browsers}]}` — the matrix |

`secrets: inherit` on the caller: `CODECOV_TOKEN` is scoped to the `CI` environment, and naming it
explicitly at the call site would pass an empty string.

## Job: `package`

One row per changed package, `fail-fast: false` so one failure doesn't cancel its siblings. Install,
`pnpm --filter <name> test:coverage`, prefix the lcov paths with the member's directory, upload
under `matrix.flag`. The flag is the unscoped package name — `packages/bench` is `bench`, and
`workers/bench` is `bench-api`, which is why the directory alone won't do.

`matrix.browsers` rows install Chromium first, sharing the `Linux-playwright-<version>` cache with
the web app's jobs. A member sets it by declaring `playwright` **and** having no `test:e2e` script
of its own — that's what separates `design-system`'s browser tier from the editor's Electron suite.

## Job: `bench`

The performance gate: `packages/styled-system/bench` runs in the pinned Docker sandbox via
[`soroush-tech/bench-action`](https://github.com/soroush-tech/bench-action) against the last npm
release, failing below 80% of the baseline. Gated on the matrix rather than its own filter, keyed on
`flag` — `dir` would match `workers/bench` too. Results post as one sticky PR comment through the
OIDC relay, falling back to the org app token and then `GITHUB_TOKEN`.
