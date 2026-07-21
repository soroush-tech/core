import { base64UrlEncode, pemToPkcs8Der } from 'src/utils/jwt'
import type { Env } from 'src/env'

export const GITHUB_API = 'https://api.github.com'

/** The bench GitHub App is not installed on the caller's repo — the route maps it to 404. */
export class AppNotInstalledError extends Error {}

/** Headers GitHub's REST API requires on every call. */
export const API_HEADERS = {
  accept: 'application/vnd.github+json',
  'user-agent': 'soroush-bench-relay',
  'x-github-api-version': '2022-11-28',
}

/**
 * Mints the short-lived App JWT (RS256) GitHub requires for app-level endpoints. `iat` is
 * backdated 60s against clock drift; `exp` stays inside GitHub's 10-minute cap.
 */
export const createAppJwt = async (privateKeyPem: string, appId: string): Promise<string> => {
  const now = Math.floor(Date.now() / 1000)
  const header = base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = base64UrlEncode(JSON.stringify({ iat: now - 60, exp: now + 540, iss: appId }))
  const signedInput = `${header}.${payload}`
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToPkcs8Der(privateKeyPem),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(signedInput)
  )
  return `${signedInput}.${base64UrlEncode(new Uint8Array(signature))}`
}

/**
 * Exchanges the App JWT for an installation access token scoped to `owner/repo`. A 404 on the
 * installation lookup means the app is not installed there (`AppNotInstalledError` → the
 * action's fallback signal); any other non-2xx is a plain error (→ 502).
 */
export const mintInstallationToken = async (
  env: Env,
  owner: string,
  repo: string
): Promise<string> => {
  const appJwt = await createAppJwt(env.BENCH_GH_APP_PRIVATE_KEY, env.BENCH_GH_APP_ID)
  const headers = { ...API_HEADERS, authorization: `Bearer ${appJwt}` }

  const installation = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/installation`, { headers })
  if (installation.status === 404) {
    throw new AppNotInstalledError(`the bench app is not installed on ${owner}/${repo}`)
  }
  if (!installation.ok) {
    throw new Error(`GitHub installation lookup failed (${installation.status})`)
  }
  const { id } = (await installation.json()) as { id: number }

  const minted = await fetch(`${GITHUB_API}/app/installations/${id}/access_tokens`, {
    method: 'POST',
    headers,
  })
  if (!minted.ok) throw new Error(`GitHub token mint failed (${minted.status})`)
  const { token } = (await minted.json()) as { token: string }
  return token
}
