# workers/

Backend deployables (Cloudflare Workers, APIs).

| Worker                             | What it is                                                                                    | Details                              |
| ---------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------ |
| **`api`** (`@soroush/api`)         | Hono API at `api.soroush.tech` — contact-form intake (`POST /v1/contact`) + a monthly cron.   | [api/worker.md](./api/worker.md)     |
| **`bench`** (`@soroush/bench-api`) | bench-action comment relay at `api.bench.soroush.tech` — branded PR report comments via OIDC. | [bench/worker.md](./bench/worker.md) |

Each worker configures itself through the shared `@soroush.tech/wrangler-tools` bins: `setup`
(also run on `predev`/`predeploy`) bootstraps the local `.env`, and `pnpm config:gen` generates
`wrangler.json` from `default.wrangler.json` + env — `wrangler.json` is generated, never
committed. Each worker's `config:gen` script lists its own required ID vars. See
[api/worker.md](./api/worker.md) for conventions and config.
