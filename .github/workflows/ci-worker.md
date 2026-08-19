[← Workflows overview](./README.md)

# `ci-worker.yml` - CI · Workers

Called by [`ci.yml`](./ci.md), never triggered on its own. The same shape as the package matrix,
over `workers/*`: the API behind the site's contact form, and the bench-action comment relay.

```yaml
# ci:validates worker__*
on: { workflow_call: ... }
```

Editing this file re-runs the workers and nothing else.

## Inputs

`node_version`, `manager`, `command`, `runner`, and `changed_workers` - the same
`{include:[...]}` shape as the package matrix. No `playwright_version`: no worker has a browser tier,
so the Playwright cache steps are absent from this file rather than skipped inside it.

## Job: `worker`

One row per changed worker. Install, `test:coverage`, repo-relative the lcov, upload under
`matrix.flag` (`api`, `bench-api`). Two rows today, discovered from `workers/*` rather than written
out - which is what replaced the two near-identical jobs this file came from.

A worker runs when it changed **or when a package it declares changed**: `workers/api` declares
`@soroush.tech/schema` and `wrangler-tools`, `workers/bench` declares `wrangler-tools`. Those edges
come from each manifest, not from a list kept in the workflow.
