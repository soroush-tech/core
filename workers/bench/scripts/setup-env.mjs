import { copyFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Bootstrap the local env: copy default.env -> .env on first setup. gen-wrangler.mjs reads .env
// for the vars it substitutes into wrangler.json; without it config:gen no-ops.
const dir = dirname(fileURLToPath(import.meta.url))
const template = resolve(dir, '../default.env')
const target = resolve(dir, '../.env')

if (process.env.CI) {
  // CD supplies the vars via ambient env (cd-worker-bench.yml); a generated .env must not appear in CI.
  console.log('setup-env: CI detected — skipping workers/bench/.env')
} else if (!existsSync(template)) {
  console.log('setup-env: no workers/bench/default.env template — nothing to copy')
} else if (existsSync(target)) {
  console.log('setup-env: workers/bench/.env already exists — leaving it untouched')
} else {
  copyFileSync(template, target)
  console.log('setup-env: created workers/bench/.env from default.env')
}
