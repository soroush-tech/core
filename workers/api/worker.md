# Worker API (`@soroush/api`)

Conventions for the Cloudflare Worker in `workers/api`. It is a [Hono](https://hono.dev) app
served at `api.soroush.tech` that handles contact-form intake (`POST /v1/contact`) and a monthly
maintenance cron. Read this before adding a file — every file has a home, and these rules decide
which one.

---

## Where code lives

`src/` is organised by responsibility. One folder per concern; the entrypoint and app wiring sit
at the root.

```
src/
  index.ts                  ← Worker entrypoint: fetch + scheduled handlers
  app.ts                    ← Hono app factory (CORS, routes, docs gate)
  env.ts                    ← Bindings + env var types (Env interface)
  openapi.ts                ← OpenAPI 3.1 spec document
  routes/
    contact.ts              ← POST /v1/contact handler
  services/                 ← external I/O — bindings & third-party calls
    email.ts                ← EMAIL binding sender
    turnstile.ts            ← Turnstile siteverify fetch
  utils/                    ← pure helpers — no I/O
    sanitize.ts             ← strip control characters
    tables.ts               ← month-table name / SQL / date helpers
  jobs/                     ← scheduled / cron work
    retention.ts            ← monthly provision + archive/drop
  db/                       ← database schema & SQL typing
    contacts.schema.sql     ← versioned __TABLE__ template (one table per month)
    sql.d.ts                ← ambient `*.sql` module declaration
```

| Folder      | Belongs here                                                             | Does **not** belong                                               |
| ----------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| `routes/`   | Hono route handlers — request parsing, status codes, the HTTP surface    | Business logic that isn't HTTP-shaped → `services/` or `utils/`   |
| `services/` | Anything that touches a binding or makes a network call (`EMAIL`, fetch) | Pure transforms → `utils/`                                        |
| `utils/`    | Pure, deterministic, I/O-free helpers                                    | Anything that awaits a binding, `fetch`, or `crypto` randomness   |
| `jobs/`     | Scheduled / cron handlers and their orchestration                        | The request path → `routes/`                                      |
| `db/`       | SQL schema templates and SQL-related type declarations                   | Query-building logic (lives with its caller, e.g. `utils/tables`) |
| root        | The entrypoint, app factory, shared `Env` types, the API spec            | Feature code — push it down into a folder                         |

---

## `services/` vs `utils/`

The single dividing line: **does it do I/O?**

- **`services/`** — touches the outside world. Reads/writes a binding (`DB`, `EMAIL`, `BACKUPS`,
  `RATE_LIMITER`), calls `fetch`, or otherwise has side effects. These are the seams you mock in
  tests. A service typically takes `env` (or a secret) as its first argument.
- **`utils/`** — pure functions. Same input → same output, no awaiting, no side effects. Trivially
  unit-testable without mocks.

When unsure, ask whether the test needs a fake binding or network stub. If yes → `services/`.

---

## Imports

Use the `src/*` path alias, the same as the web app:

- **Cross-folder** imports use the alias: `import { notify } from 'src/services/email'`.
- **Same-folder** siblings (including the co-located test) use `./`:
  `import { app } from './app'`, `import { notify } from './email'`.
- **Never use `../`.** If you reach for a parent path, use the alias instead.

The alias is wired in three places that must stay in agreement:

1. `tsconfig.json` → `compilerOptions.paths` (`"src/*": ["./src/*"]`) — for `tsc`.
2. `vitest.config.ts` → `resolve.alias` — for tests.
3. Wrangler's esbuild reads the tsconfig `paths` automatically — for the bundle.

---

## Testing & coverage

- **Co-locate** the unit test next to its source: `email.ts` + `email.test.ts` in the same folder.
- **100% coverage is enforced** by vitest (`thresholds: { 100: true }` in `vitest.config.ts`). Run
  `pnpm test:coverage` and verify before pushing — anything under 100% fails the build.
- Type-only files (`env.ts`, `db/sql.d.ts`) and data files (`db/contacts.schema.sql`) have no logic
  and therefore no test. `index.ts` is exercised through `app.test.ts`.
- Mock bindings/`fetch` to test `services/`; call `utils/` directly with plain values.

---

## Schema & SQL

Contact submissions are partitioned into one table per month — `contacts_YYYY_MM`. The schema lives
once in `db/contacts.schema.sql` as a `__TABLE__` template, **not** inline in code, so the write path
(create-on-first-write) and the cron (provision + archive) share a single definition.

`db/sql.d.ts` declares `*.sql` as a text module so `import schema from 'src/db/contacts.schema.sql'`
yields the raw string. This works under both bundlers: Wrangler's `Text` module rule at runtime, and
the `sqlAsText` loader plugin in `vitest.config.ts` under test.

---

## Config

`wrangler.json` is **generated, never edited by hand**. The template `default.wrangler.json` holds
`${VAR}` placeholders that the shared `gen-wrangler` bin (`@soroush.tech/wrangler-tools`)
substitutes from the environment (or local `.env`); the required ID vars are listed on the
`config:gen` script in `package.json`:

```
pnpm config:gen     # render wrangler.json from the template
pnpm dev            # predev runs config:gen, then wrangler dev
pnpm deploy         # predeploy runs config:gen, then wrangler deploy
```

Generated `wrangler.json`, `.env`, `.wrangler/`, `coverage/`, and `dist/` are git-ignored.

---

## Adding a new file — quick guide

1. **A new endpoint?** → `routes/`. Keep it thin: parse, validate, delegate, respond.
2. **Talks to a binding or external API?** → `services/`.
3. **A pure transform/helper?** → `utils/`.
4. **Runs on the cron?** → `jobs/`.
5. Co-locate a `*.test.ts`, import cross-folder via `src/*`, and keep coverage at 100%.
