import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

/** ID vars that mark a configured (CI/deploy) context. */
export const REQUIRED = ['WORKER_NAME', 'BENCH_GH_APP_ID']

/**
 * Only (re)generate `wrangler.json` when the ID vars are present — i.e. in CI/deploy.
 * Locally they are absent, so a hand-maintained `wrangler.json` is left untouched.
 */
export const shouldGenerate = (env) => REQUIRED.every((key) => Boolean(env[key]))

/**
 * Substitute `${VAR}` placeholders in `template` from `env`. Throws on any missing/empty
 * referenced var so a half-configured deploy fails loudly rather than shipping `${...}`.
 */
export const renderConfig = (template, env) =>
  template.replace(/\$\{(\w+)\}/g, (_match, name) => {
    const value = env[name]
    if (value === undefined || value === '') {
      throw new Error(`gen-wrangler: missing env var ${name}`)
    }
    return value
  })

/* v8 ignore start -- thin CLI/IO shell, exercised at deploy time */
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dir = dirname(fileURLToPath(import.meta.url))
  // Local dev keeps its IDs in workers/bench/.env so they stay out of the repo. CI/deploy has
  // no such file and supplies the vars via the ambient environment, which loadEnvFile leaves
  // untouched (it never overrides already-set vars).
  try {
    process.loadEnvFile(resolve(dir, '../.env'))
  } catch {
    // no local .env (CI) — rely on the ambient environment
  }
  if (shouldGenerate(process.env)) {
    const template = readFileSync(resolve(dir, '../default.wrangler.json'), 'utf8')
    writeFileSync(resolve(dir, '../wrangler.json'), renderConfig(template, process.env))
    console.log('gen-wrangler: wrote wrangler.json from env')
  } else {
    console.log('gen-wrangler: ID vars not set — leaving any local wrangler.json untouched')
  }
}
/* v8 ignore stop */
