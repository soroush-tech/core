import { decodeJwt } from 'src/utils/jwt'

export const OIDC_ISSUER = 'https://token.actions.githubusercontent.com'
export const JWKS_URL = `${OIDC_ISSUER}/.well-known/jwks`
/** Fixed audience the action requests its OIDC token with (`core.getIDToken(audience)`). */
export const OIDC_AUDIENCE = 'soroush-bench-action'

/** OIDC verification failure — the route maps it to 401. */
export class OidcError extends Error {}

/** Allowed clock skew between GitHub's token clock and ours, in seconds. */
const CLOCK_LEEWAY_S = 60

/**
 * Verifies a GitHub Actions OIDC JWT (JWKS signature, issuer, audience, validity window) and
 * returns its `repository` claim — the only caller identity the relay trusts. Throws `OidcError`
 * on any verification failure; a JWKS fetch that dies on the network rejects as-is (→ 502).
 */
export const verifyActionsOidc = async (token: string, audience: string): Promise<string> => {
  let decoded
  try {
    decoded = decodeJwt(token)
  } catch {
    throw new OidcError('malformed token')
  }
  const { header, payload, signedInput, signature } = decoded

  // GitHub's JWKS rotates rarely; the Cloudflare cache keeps us from refetching per request.
  const res = await fetch(JWKS_URL, { cf: { cacheTtl: 3600, cacheEverything: true } })
  if (!res.ok) throw new OidcError(`JWKS fetch failed (${res.status})`)
  const { keys } = (await res.json()) as { keys: (JsonWebKey & { kid?: string })[] }
  const jwk = keys.find((key) => key.kid === header.kid)
  if (jwk === undefined) throw new OidcError('unknown signing key')

  const key = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  )
  const valid = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    key,
    signature,
    new TextEncoder().encode(signedInput)
  )
  if (!valid) throw new OidcError('invalid signature')

  const now = Date.now() / 1000
  if (payload.iss !== OIDC_ISSUER) throw new OidcError('wrong issuer')
  if (payload.aud !== audience) throw new OidcError('wrong audience')
  if (typeof payload.exp !== 'number' || payload.exp < now - CLOCK_LEEWAY_S) {
    throw new OidcError('token expired')
  }
  if (typeof payload.nbf === 'number' && payload.nbf > now + CLOCK_LEEWAY_S) {
    throw new OidcError('token not yet valid')
  }
  if (typeof payload.repository !== 'string' || payload.repository === '') {
    throw new OidcError('missing repository claim')
  }
  return payload.repository
}
