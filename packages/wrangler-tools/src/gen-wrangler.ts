import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

type Env = Record<string, string | undefined>

/** True when every ID var marking a configured (CI/deploy) context is present. */
export const shouldGenerate = (env: Env, required: string[]): boolean =>
  required.every((key) => Boolean(env[key]))

/**
 * Substitute `${VAR}` placeholders in `template` from `env`. Throws on any missing/empty
 * referenced var so a half-configured deploy fails loudly rather than shipping `${...}`.
 */
export const renderConfig = (template: string, env: Env): string =>
  template.replace(/\$\{(\w+)\}/g, (_match, name: string) => {
    const value = env[name]
    if (value === undefined || value === '') {
      throw new Error(`gen-wrangler: missing env var ${name}`)
    }
    return value
  })

/**
 * Generate `dir/wrangler.json` from `dir/default.wrangler.json` when the `required` ID vars
 * are present — i.e. in CI/deploy. Locally they are absent, so a hand-maintained
 * `wrangler.json` is left untouched. Local dev keeps its IDs in `dir/.env` so they stay out
 * of the repo; CI/deploy has no such file and supplies the vars via the ambient environment,
 * which `loadEnvFile` leaves untouched (it never overrides already-set vars).
 */
export const generate = (dir: string, required: string[], env: Env): void => {
  try {
    process.loadEnvFile(resolve(dir, '.env'))
  } catch (error) {
    // Only an absent .env (CI) falls back to the ambient environment — a malformed or
    // unreadable one must fail loudly instead of silently generating stale config.
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
  }
  if (shouldGenerate(env, required)) {
    const template = readFileSync(resolve(dir, 'default.wrangler.json'), 'utf8')
    writeFileSync(resolve(dir, 'wrangler.json'), renderConfig(template, env))
    console.log('gen-wrangler: wrote wrangler.json from env')
  } else {
    console.log('gen-wrangler: ID vars not set — leaving any local wrangler.json untouched')
  }
}
