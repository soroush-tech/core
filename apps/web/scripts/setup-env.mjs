import { copyFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Bootstrap the local env: copy default.env -> .env.local on first setup. Vite loads .env.local
// (not default.env), so without this a fresh clone runs with empty VITE_* and the API calls fail.
const dir = dirname(fileURLToPath(import.meta.url))
const template = resolve(dir, '../default.env')
const target = resolve(dir, '../.env.local')

if (process.env.CI) {
  // CD injects VITE_* via ambient env (cd-web.yml); a generated .env.local must never appear in CI.
  console.log('setup-env: CI detected - skipping apps/web/.env.local')
} else if (!existsSync(template)) {
  console.log('setup-env: no apps/web/default.env template - nothing to copy')
} else if (existsSync(target)) {
  console.log('setup-env: apps/web/.env.local already exists - leaving it untouched')
} else {
  copyFileSync(template, target)
  console.log('setup-env: created apps/web/.env.local from default.env')
}
