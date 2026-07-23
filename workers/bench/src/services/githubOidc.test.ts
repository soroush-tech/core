import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest'
import { JWKS_URL, OIDC_AUDIENCE, OIDC_ISSUER, OidcError, verifyActionsOidc } from './githubOidc'
import { base64UrlEncode } from 'src/utils/jwt'

const ALG = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }

let privateKey: CryptoKey
let jwk: JsonWebKey & { kid?: string }

beforeAll(async () => {
  const pair = await crypto.subtle.generateKey(
    { ...ALG, modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]) },
    true,
    ['sign', 'verify']
  )
  privateKey = pair.privateKey
  jwk = { ...(await crypto.subtle.exportKey('jwk', pair.publicKey)), kid: 'test-key' }
})

const nowSeconds = () => Math.floor(Date.now() / 1000)

/** Claims of a token that verifies, with per-test overrides (undefined drops the claim). */
const claims = (overrides: Record<string, unknown> = {}) => ({
  iss: OIDC_ISSUER,
  aud: OIDC_AUDIENCE,
  exp: nowSeconds() + 300,
  nbf: nowSeconds() - 30,
  repository: 'soroush-tech/core',
  ...overrides,
})

/** Mint a genuinely signed test JWT with the generated key. */
const mintToken = async (payload: Record<string, unknown>, kid = 'test-key') => {
  const head = base64UrlEncode(JSON.stringify({ alg: 'RS256', kid }))
  const body = base64UrlEncode(JSON.stringify(payload))
  const signedInput = `${head}.${body}`
  const signature = await crypto.subtle.sign(
    ALG.name,
    privateKey,
    new TextEncoder().encode(signedInput)
  )
  return `${signedInput}.${base64UrlEncode(new Uint8Array(signature))}`
}

const stubJwks = (payload: unknown = undefined, status = 200) => {
  const body = JSON.stringify(payload ?? { keys: [jwk] })
  const fetch = vi.fn(async () => new Response(body, { status }))
  vi.stubGlobal('fetch', fetch)
  return fetch
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('verifyActionsOidc', () => {
  it('returns the repository claim of a valid token, fetching the JWKS', async () => {
    const fetch = stubJwks()
    const token = await mintToken(claims())

    expect(await verifyActionsOidc(token, OIDC_AUDIENCE)).toBe('soroush-tech/core')
    expect(fetch.mock.calls[0][0]).toBe(JWKS_URL)
  })

  it('rejects a malformed token', async () => {
    stubJwks()
    await expect(verifyActionsOidc('not-a-jwt', OIDC_AUDIENCE)).rejects.toThrow(OidcError)
  })

  it('rejects when the JWKS fetch is not ok', async () => {
    stubJwks({ keys: [] }, 500)
    const token = await mintToken(claims())
    await expect(verifyActionsOidc(token, OIDC_AUDIENCE)).rejects.toThrow('JWKS fetch failed')
  })

  it('rejects a token signed by an unknown key', async () => {
    stubJwks()
    const token = await mintToken(claims(), 'other-key')
    await expect(verifyActionsOidc(token, OIDC_AUDIENCE)).rejects.toThrow('unknown signing key')
  })

  it('rejects a token whose payload was tampered with', async () => {
    stubJwks()
    const good = (await mintToken(claims())).split('.')
    const tampered = `${good[0]}.${base64UrlEncode(
      JSON.stringify(claims({ repository: 'evil/repo' }))
    )}.${good[2]}`
    await expect(verifyActionsOidc(tampered, OIDC_AUDIENCE)).rejects.toThrow('invalid signature')
  })

  it('rejects a wrong issuer', async () => {
    stubJwks()
    const token = await mintToken(claims({ iss: 'https://evil.example' }))
    await expect(verifyActionsOidc(token, OIDC_AUDIENCE)).rejects.toThrow('wrong issuer')
  })

  it('rejects a wrong audience', async () => {
    stubJwks()
    const token = await mintToken(claims({ aud: 'someone-else' }))
    await expect(verifyActionsOidc(token, OIDC_AUDIENCE)).rejects.toThrow('wrong audience')
  })

  it('rejects an expired or exp-less token', async () => {
    stubJwks()
    const expired = await mintToken(claims({ exp: nowSeconds() - 120 }))
    await expect(verifyActionsOidc(expired, OIDC_AUDIENCE)).rejects.toThrow('token expired')

    stubJwks()
    const expless = await mintToken(claims({ exp: undefined }))
    await expect(verifyActionsOidc(expless, OIDC_AUDIENCE)).rejects.toThrow('token expired')
  })

  it('rejects a not-yet-valid token', async () => {
    stubJwks()
    const token = await mintToken(claims({ nbf: nowSeconds() + 120 }))
    await expect(verifyActionsOidc(token, OIDC_AUDIENCE)).rejects.toThrow('token not yet valid')
  })

  it('accepts a token without an nbf claim', async () => {
    stubJwks()
    const token = await mintToken(claims({ nbf: undefined }))
    expect(await verifyActionsOidc(token, OIDC_AUDIENCE)).toBe('soroush-tech/core')
  })

  it('rejects a missing, non-string, or empty repository claim', async () => {
    stubJwks()
    const missing = await mintToken(claims({ repository: undefined }))
    await expect(verifyActionsOidc(missing, OIDC_AUDIENCE)).rejects.toThrow(
      'missing repository claim'
    )

    stubJwks()
    const empty = await mintToken(claims({ repository: '' }))
    await expect(verifyActionsOidc(empty, OIDC_AUDIENCE)).rejects.toThrow(
      'missing repository claim'
    )
  })
})
