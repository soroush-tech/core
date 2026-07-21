[← Workflows overview](./README.md)

# `cd-worker-bench.yml` — Deploy Worker (`@soroush/bench-api`)

Deploys the bench-action comment relay (`workers/bench`, served at
`api.bench.soroush.tech` — see [`workers/bench/worker.md`](../../workers/bench/worker.md)).
Structurally a mirror of [`cd-worker-api.md`](./cd-worker-api.md): **gated on CI success**
(`workflow_run` of `Continuous Integration` + manual `workflow_dispatch`), concurrency group
`deploy-worker-bench` with `cancel-in-progress: false`.

## Job: `changes`

Same shape as the api worker's: manual dispatch or a missing `changes.json` artifact → deploy;
otherwise deploy when

```js
const worker = (c.worker || []).includes('bench') || c.root
```

(No package dependency edges yet — the relay consumes no workspace packages.)

## Job: `deploy`

`environment: cd-worker-bench` · checkout → `.nvmrc` node → pnpm install →
`pnpm --filter @soroush/bench-api config:gen` (env: `WORKER_NAME`, `BENCH_GH_APP_ID`) →
`cloudflare/wrangler-action` (SHA-pinned) `command: deploy` in `workers/bench`. The first
deploy creates the `api.bench.soroush.tech` custom domain from the generated config.

### `cd-worker-bench` environment values

| Kind     | Name                    | Meaning                                   |
| -------- | ----------------------- | ----------------------------------------- |
| variable | `WORKER_NAME`           | Cloudflare worker name (e.g. `bench-api`) |
| variable | `BENCH_GH_APP_ID`       | GitHub App id of the bench bot            |
| variable | `CLOUDFLARE_ACCOUNT_ID` | same account as the api worker            |
| secret   | `CLOUDFLARE_API_TOKEN`  | same token scope as the api worker deploy |

The App private key is **not** a CI value — it's a Worker secret set once out-of-band
(`wrangler secret put BENCH_GH_APP_PRIVATE_KEY`, PKCS#8; see the worker doc).
