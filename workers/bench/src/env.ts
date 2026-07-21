/** Cloudflare Workers rate-limit binding: `limit({ key })` → `{ success }`. */
export interface RateLimit {
  limit(options: { key: string }): Promise<{ success: boolean }>
}

/** Worker bindings and environment variables. */
export interface Env {
  /** GitHub App id of the bench bot (numeric string), from the wrangler `vars`. */
  BENCH_GH_APP_ID: string
  /** Bench bot GitHub App private key, PKCS#8 PEM (a Worker secret, `wrangler secret put`). */
  BENCH_GH_APP_PRIVATE_KEY: string
  /** Per-IP rate limiter for the report endpoint (3 requests / 60s). */
  RATE_LIMITER: RateLimit
  /** When `'true'`, serve Swagger UI + OpenAPI (local/preview only; never set in production). */
  DOCS_ENABLED?: string
}
