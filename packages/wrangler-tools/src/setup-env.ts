import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Bootstrap the local env: copy `dir/default.env` -> `dir/.env` on first setup. gen-wrangler
 * reads `.env` for the vars it substitutes into `wrangler.json`; without it config:gen no-ops.
 * CD supplies the vars via the ambient environment instead, so CI never writes a `.env`.
 */
export const setupEnv = (dir: string, env: Record<string, string | undefined>): void => {
  if (env.CI) {
    console.log('setup-env: CI detected — skipping .env')
    return
  }
  const template = resolve(dir, 'default.env')
  const target = resolve(dir, '.env')
  if (!existsSync(template)) {
    console.log('setup-env: no default.env template — nothing to copy')
  } else if (existsSync(target)) {
    console.log('setup-env: .env already exists — leaving it untouched')
  } else {
    copyFileSync(template, target)
    console.log('setup-env: created .env from default.env')
  }
}
