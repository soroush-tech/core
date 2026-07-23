import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest'
import { AppNotInstalledError, GITHUB_API, createAppJwt, mintInstallationToken } from './githubApp'
import { decodeJwt } from 'src/utils/jwt'
import type { Env } from 'src/env'

const ALG = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }

let publicKey: CryptoKey
let pem: string

beforeAll(async () => {
  const pair = await crypto.subtle.generateKey(
    { ...ALG, modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]) },
    true,
    ['sign', 'verify']
  )
  publicKey = pair.publicKey
  const der = new Uint8Array(await crypto.subtle.exportKey('pkcs8', pair.privateKey))
  pem = `-----BEGIN PRIVATE KEY-----\n${btoa(String.fromCharCode(...der))}\n-----END PRIVATE KEY-----`
})

const env = () => ({ BENCH_GH_APP_ID: '123', BENCH_GH_APP_PRIVATE_KEY: pem }) as Env

const stubFetchSequence = (...responses: Response[]) => {
  const fetch = vi.fn()
  for (const response of responses) fetch.mockResolvedValueOnce(response)
  vi.stubGlobal('fetch', fetch)
  return fetch
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('createAppJwt', () => {
  it('mints an RS256 JWT with the app id as issuer and a 10-minute window', async () => {
    const token = await createAppJwt(pem, '123')
    const { header, payload, signedInput, signature } = decodeJwt(token)

    expect(header).toEqual({ alg: 'RS256', typ: 'JWT' })
    expect(payload.iss).toBe('123')
    expect((payload.exp as number) - (payload.iat as number)).toBe(600)

    const valid = await crypto.subtle.verify(
      ALG.name,
      publicKey,
      signature,
      new TextEncoder().encode(signedInput)
    )
    expect(valid).toBe(true)
  })
})

describe('mintInstallationToken', () => {
  it('looks up the installation and mints its access token', async () => {
    const fetch = stubFetchSequence(
      new Response(JSON.stringify({ id: 42 })),
      new Response(JSON.stringify({ token: 'installation-token' }))
    )

    expect(await mintInstallationToken(env(), 'o', 'r')).toBe('installation-token')

    const [lookupUrl, lookupInit] = fetch.mock.calls[0] as [string, RequestInit]
    expect(lookupUrl).toBe(`${GITHUB_API}/repos/o/r/installation`)
    expect((lookupInit.headers as Record<string, string>).authorization).toMatch(/^Bearer /)

    const [mintUrl, mintInit] = fetch.mock.calls[1] as [string, RequestInit]
    expect(mintUrl).toBe(`${GITHUB_API}/app/installations/42/access_tokens`)
    expect(mintInit.method).toBe('POST')
  })

  it('throws AppNotInstalledError on a 404 installation lookup', async () => {
    stubFetchSequence(new Response('', { status: 404 }))
    await expect(mintInstallationToken(env(), 'o', 'r')).rejects.toThrow(AppNotInstalledError)
  })

  it('throws on any other failed installation lookup', async () => {
    stubFetchSequence(new Response('', { status: 500 }))
    await expect(mintInstallationToken(env(), 'o', 'r')).rejects.toThrow(
      'GitHub installation lookup failed (500)'
    )
  })

  it('throws when the token mint fails', async () => {
    stubFetchSequence(new Response(JSON.stringify({ id: 42 })), new Response('', { status: 422 }))
    await expect(mintInstallationToken(env(), 'o', 'r')).rejects.toThrow(
      'GitHub token mint failed (422)'
    )
  })
})
