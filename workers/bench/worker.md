# `@soroush/bench-api` — bench-action comment relay

A Cloudflare Worker at **`api.bench.soroush.tech`** that lets
[`soroush-tech/bench-action`](https://github.com/soroush-tech/bench-action) post its PR results
comment as the bench GitHub App bot (branded author) instead of `github-actions[bot]` — the
Codecov model: the App identity lives only in this Worker, never in the public action. Design:
soroush-tech/core#308 (RFC) / #309 (epic).

Follows `workers/api/worker.md` conventions: `routes/` (thin handlers) vs `services/` (I/O —
the mockable seams) vs `utils/` (pure), `src/*` alias, co-located `*.test.ts`, **100% coverage**
(`thresholds: { 100: true }`). No D1/R2/cron; no CORS/origin guard — callers are CI runners,
not browsers, and every report request authenticates with a GitHub Actions OIDC JWT. The per-IP
rate limit (3/60s, `/v1/health` exempt) mirrors the api worker.

## Endpoint

`POST /v1/report` — `Authorization: Bearer <GitHub Actions OIDC JWT>` (audience
`soroush-bench-action`), JSON `{ repository: "owner/repo", prNumber, body }`; `body` must start
with the `<!-- soroush-bench-action -->` marker and stay under 64 KiB.

| Status | Meaning                                                               |
| ------ | --------------------------------------------------------------------- |
| 200    | `{ ok, commentId }` — comment upserted as the bot                     |
| 400    | invalid JSON / payload (marker missing, bad repo shape)               |
| 401    | missing/invalid OIDC token, or payload repo ≠ verified `repository`   |
| 404    | App not installed on the caller's repo — the action's fallback signal |
| 413    | payload too large                                                     |
| 429    | per-IP rate limit                                                     |
| 502    | GitHub API failure                                                    |

Flow: verify the JWT against GitHub's JWKS (`services/githubOidc.ts`; the `repository` claim is
the only trusted caller identity) → mint an App installation token (`services/githubApp.ts`;
App JWT is RS256 via `crypto.subtle`, zero deps) → upsert the marker-matched comment
(`services/githubComment.ts`).

Swagger UI (`/v1/docs`) + OpenAPI (`/v1/openapi.json`, from `src/openapi.ts` — the report
request body derives from the route's zod schema) are served only when `DOCS_ENABLED=true`
(local `.env`; never set in production), same as the api worker.

## Config

`wrangler.json` is generated from `default.wrangler.json` by `pnpm config:gen` (the shared
`@soroush.tech/wrangler-tools` bin; required vars `WORKER_NAME`, `BENCH_GH_APP_ID`) — same
pattern as the api worker.

Deploys via `.github/workflows/cd-worker-bench.yml` (CI-success-gated, `cd-worker-bench`
environment), which creates the `api.bench.soroush.tech` custom domain on first deploy.

## Local dev

First run: `pnpm run setup` (copies `default.env` → `.env` with dev placeholder vars —
`setup` is a pnpm built-in, so the explicit `run` is required), then `pnpm dev`
(`predev` regenerates `wrangler.json` from `.env`). The dev server is pinned to
**port 8788** (the api worker owns wrangler's default 8787): docs live at
`http://127.0.0.1:8788/v1/docs`. With just the placeholder vars, `/v1/health` and
all validation/OIDC paths work; only the real GitHub path needs the production App
configuration.
