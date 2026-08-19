/** Cloudflare Workers rate-limit binding: `limit({ key })` → `{ success }`. */
export interface RateLimit {
  limit(options: { key: string }): Promise<{ success: boolean }>
}

/** Worker bindings and environment variables. */
export interface Env {
  VITE_CONTACT_HONEYPOT: string
  /** D1 database holding the `contacts` table. */
  DB: D1Database
  /** R2 bucket where retention archives expired submissions. */
  BACKUPS: R2Bucket
  /** Resend API key (a Worker secret) for sending owner notifications via the Resend HTTP API. */
  RESEND_API_KEY: string
  /** Cloudflare Turnstile secret (a Worker secret). Empty disables captcha verification. */
  TURNSTILE_SECRET: string
  /**
   * Comma-separated hostnames a Turnstile token may be solved on (e.g.
   * `soroush.tech,www.soroush.tech`). Unset/empty skips the hostname check - set only in
   * production config, so the local test secret keeps working.
   */
  TURNSTILE_HOSTNAME?: string
  /** Per-IP rate limiter for the contact endpoint (1 request / 60s). */
  RATE_LIMITER: RateLimit
  /** When `'true'`, serve Swagger UI + OpenAPI (local/preview only; never set in production). */
  DOCS_ENABLED?: string
  /**
   * Local web origin to allow through CORS during development (e.g. http://localhost:5173).
   * Supplied only via workers/api/.env and never set in production, so localhost can never be
   * granted in a deployed Worker.
   */
  ALLOW_ORIGIN?: string
  /** Months of submissions kept live before a month table is archived and dropped (default 6). */
  RETENTION_MONTHS?: string
}
