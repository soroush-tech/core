# @soroush/api

The contact-form backend Worker (Hono). Exposes `POST /v1/contact` and a `GET /v1/health`
check, persists submissions to D1, and emails the owner via the Resend HTTP API.

## Data model & retention

Submissions are **partitioned into one table per month**, `contacts_YYYY_MM`. The table schema
is the versioned `src/contacts.schema.sql` (a `__TABLE__` template the runtime instantiates — see
`src/tables.ts`); there is no central migration. The write path creates the current month's table
on first use (`CREATE TABLE IF NOT EXISTS`).

A monthly cron (`runMonthlyMaintenance`) does two things:

1. **Provision** this month's and next month's tables (idempotent).
2. **Retention:** any `contacts_YYYY_MM` older than `RETENTION_MONTHS` (default 6) is archived to
   R2 as `contacts_YYYY_MM.sql` (a restorable dump) and then **dropped** — no row `DELETE`s.

The R2 `.sql` archives still contain personal data, so the `BACKUPS` bucket should carry a
**lifecycle expiry rule** (e.g. delete after 12 months) for genuine GDPR retention — see setup
below. Individual erasure (Art. 17) is handled manually via wrangler for now.

## Routes

| Method | Path               | Purpose                                                         |
| ------ | ------------------ | --------------------------------------------------------------- |
| `GET`  | `/v1/health`       | Liveness check → `200 { ok: true }`.                            |
| `POST` | `/v1/contact`      | Validate, drop honeypot hits, store in D1, email the owner.     |
| `GET`  | `/v1/docs`         | Swagger UI — **only when `DOCS_ENABLED=true`** (404 otherwise). |
| `GET`  | `/v1/openapi.json` | OpenAPI 3.1 spec — same gate as `/v1/docs`.                     |

The OpenAPI spec is generated from the shared `@soroush.tech/schema` zod schema (`z.toJSONSchema`),
so it stays in sync with validation. `DOCS_ENABLED` is set only in local `.env` and is **never** in
the prod config, so production never exposes docs.

CORS is locked to `https://soroush.tech` and `https://www.soroush.tech`.

## Bindings & config

`wrangler.json` is **generated from env** (see the `default.wrangler.json` template and
the shared `@soroush.tech/wrangler-tools` bin) so no IDs land in the repo. Bindings: `DB` (D1), `BACKUPS` (R2).
Secrets: `RESEND_API_KEY` (Resend send), `TURNSTILE_SECRET` (captcha). Vars:
`VITE_CONTACT_HONEYPOT` (hidden field name, shared key with the web), `RETENTION_MONTHS`
(default `6`), `TURNSTILE_HOSTNAME` (comma-separated hostnames a Turnstile token may be solved on;
set in prod config only, so the local test secret keeps working). The schema template `*.sql` is bundled as a string via wrangler's default `Text`
module rule.

Month tables are created at runtime, so **no `wrangler d1 migrations apply` is needed** — a fresh
local D1 gets its tables on the first `POST /v1/contact` (and from the cron).

### One-time R2 lifecycle (GDPR)

Set an expiry rule on the `BACKUPS` bucket for the `contacts_` prefix so archived personal data is
retired rather than kept forever, e.g. via `wrangler r2 bucket lifecycle ...` or the dashboard
(verify the exact subcommand against the installed wrangler version).

## One-time email setup

Email is sent via [Resend](https://resend.com) (free tier) over HTTPS — sending-only, so it
coexists with Google Workspace handling inbound mail. **Do not enable Cloudflare Email Routing**
on the domain (it would hijack the Google MX).

1. Create a Resend account and **verify `soroush.tech`** (Domains → Add) — add exactly the
   records Resend lists (DKIM `resend._domainkey` + a `send.` subdomain MX/SPF). These are
   sending-only on a subdomain, so the apex `MX` for Google stays untouched. Separately, the apex
   has **no SPF** today — add `v=spf1 include:_spf.google.com ~all` for your Google-sent mail.
2. Create a Resend API key and set it as the Worker secret:
   `wrangler secret put RESEND_API_KEY`.
3. For local dev, put `RESEND_API_KEY` where the other dev secrets live (see `default.env`).

Mail is sent from `contact@soroush.tech` to `masoud@soroush.tech`, `reply_to` the submitter.

## Testing

`pnpm --filter @soroush/api test:coverage` — the Hono app is exercised in-process via
`app.request()` with mocked D1/R2 bindings and a stubbed `fetch` (Resend + Turnstile); 100%
coverage is required.
