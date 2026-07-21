import { describe, it, expect, vi, beforeEach } from 'vitest'
import { app } from 'src/app'
import type { Env } from 'src/env'
import { OidcError, verifyActionsOidc } from 'src/services/githubOidc'
import { AppNotInstalledError, mintInstallationToken } from 'src/services/githubApp'
import { BENCH_MARKER, upsertBenchComment } from 'src/services/githubComment'

vi.mock('src/services/githubOidc', async (importOriginal) => ({
  ...(await importOriginal<typeof import('src/services/githubOidc')>()),
  verifyActionsOidc: vi.fn(),
}))
vi.mock('src/services/githubApp', async (importOriginal) => ({
  ...(await importOriginal<typeof import('src/services/githubApp')>()),
  mintInstallationToken: vi.fn(),
}))
vi.mock('src/services/githubComment', async (importOriginal) => ({
  ...(await importOriginal<typeof import('src/services/githubComment')>()),
  upsertBenchComment: vi.fn(),
}))

const verify = vi.mocked(verifyActionsOidc)
const mint = vi.mocked(mintInstallationToken)
const upsert = vi.mocked(upsertBenchComment)

// No cf-connecting-ip header in tests, so the app-level rate limiter is skipped and the env
// needs no bindings.
const env = {} as Env

const validBody = () =>
  JSON.stringify({ repository: 'o/r', prNumber: 5, body: `${BENCH_MARKER}\n\n## Results` })

const post = (body: string, headers: Record<string, string> = {}) =>
  app.request(
    '/v1/report',
    { method: 'POST', headers: { authorization: 'Bearer the-jwt', ...headers }, body },
    env
  )

beforeEach(() => {
  vi.resetAllMocks()
})

describe('POST /v1/report', () => {
  it('rejects oversized payloads before parsing', async () => {
    const res = await post(validBody(), { 'content-length': String(1024 * 1024) })
    expect(res.status).toBe(413)
  })

  it('rejects a missing bearer token', async () => {
    const res = await app.request('/v1/report', { method: 'POST', body: validBody() }, env)
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ ok: false, error: 'Missing bearer token' })
  })

  it('rejects invalid JSON', async () => {
    const res = await post('not json')
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ ok: false, error: 'Invalid JSON' })
  })

  it('rejects a payload that fails validation (no marker prefix)', async () => {
    const res = await post(JSON.stringify({ repository: 'o/r', prNumber: 5, body: 'no marker' }))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ ok: false, error: 'Invalid payload' })
  })

  it('maps an OIDC failure to 401', async () => {
    verify.mockRejectedValue(new OidcError('bad'))
    const res = await post(validBody())
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ ok: false, error: 'Invalid OIDC token' })
  })

  it('rejects a payload repository that differs from the OIDC claim', async () => {
    verify.mockResolvedValue('someone-else/repo')
    const res = await post(validBody())
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ ok: false, error: 'Repository mismatch' })
  })

  it('maps an uninstalled app to 404 so the action can fall back', async () => {
    verify.mockResolvedValue('o/r')
    mint.mockRejectedValue(new AppNotInstalledError('not installed'))
    const res = await post(validBody())
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ ok: false, error: 'App not installed' })
  })

  it('maps any other GitHub failure to 502', async () => {
    verify.mockResolvedValue('o/r')
    mint.mockRejectedValue(new Error('boom'))
    const res = await post(validBody())
    expect(res.status).toBe(502)
    expect(await res.json()).toEqual({ ok: false, error: 'GitHub API error' })
  })

  it('upserts the comment and returns its id (repository match is case-insensitive)', async () => {
    verify.mockResolvedValue('O/R')
    mint.mockResolvedValue('installation-token')
    upsert.mockResolvedValue(77)

    const res = await post(validBody())
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, commentId: 77 })
    expect(verify).toHaveBeenCalledWith('the-jwt', 'soroush-bench-action')
    expect(upsert).toHaveBeenCalledWith(
      'installation-token',
      'o',
      'r',
      5,
      `${BENCH_MARKER}\n\n## Results`
    )
  })
})
