import { describe, it, expect, vi } from 'vitest'
import { app } from './app'
import worker from './index'
import type { Env } from './env'

const makeEnv = (success = true, docsEnabled = false) => {
  const limit = vi.fn(async () => ({ success }))
  return {
    env: {
      RATE_LIMITER: { limit },
      DOCS_ENABLED: docsEnabled ? 'true' : undefined,
    } as unknown as Env,
    limit,
  }
}

describe('app', () => {
  it('serves /health without consulting the rate limiter', async () => {
    const { env, limit } = makeEnv()
    const res = await app.request('/v1/health', { headers: { 'cf-connecting-ip': '1.2.3.4' } }, env)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
    expect(limit).not.toHaveBeenCalled()
  })

  it('rate-limits report requests per client IP', async () => {
    const { env, limit } = makeEnv(false)
    const res = await app.request(
      '/v1/report',
      { method: 'POST', headers: { 'cf-connecting-ip': '1.2.3.4' } },
      env
    )
    expect(res.status).toBe(429)
    expect(limit).toHaveBeenCalledWith({ key: '1.2.3.4' })
  })

  it('passes rate-limited requests through to the route', async () => {
    const { env } = makeEnv(true)
    const res = await app.request(
      '/v1/report',
      { method: 'POST', headers: { 'cf-connecting-ip': '1.2.3.4' } },
      env
    )
    // Reaches the report route, which rejects the missing bearer token.
    expect(res.status).toBe(401)
  })

  it('skips the limiter when no client IP header is present (local dev)', async () => {
    const { env, limit } = makeEnv(false)
    const res = await app.request('/v1/report', { method: 'POST' }, env)
    expect(res.status).toBe(401)
    expect(limit).not.toHaveBeenCalled()
  })

  it('hides the docs routes when DOCS_ENABLED is unset', async () => {
    const { env } = makeEnv()
    expect((await app.request('/v1/docs', {}, env)).status).toBe(404)
    expect((await app.request('/v1/openapi.json', {}, env)).status).toBe(404)
  })

  it('serves Swagger UI and the OpenAPI document when DOCS_ENABLED is true', async () => {
    const { env, limit } = makeEnv(false, true)
    const spec = await app.request(
      '/v1/openapi.json',
      { headers: { 'cf-connecting-ip': '1.2.3.4' } },
      env
    )
    expect(spec.status).toBe(200)
    const document = (await spec.json()) as { info: { title: string }; paths: object }
    expect(document.info.title).toBe('@soroush/bench-api')
    expect(Object.keys(document.paths)).toEqual(['/health', '/report'])
    // Docs paths bypass the rate limiter (the limiter env here always denies).
    expect(limit).not.toHaveBeenCalled()

    const docs = await app.request('/v1/docs', {}, env)
    expect(docs.status).toBe(200)
    expect(await docs.text()).toContain('SwaggerUI')
  })

  it('exposes app.fetch as the worker entrypoint', async () => {
    const { env } = makeEnv()
    const res = await worker.fetch(
      new Request('https://api.bench.soroush.tech/v1/health'),
      env,
      {} as ExecutionContext
    )
    expect(res.status).toBe(200)
  })
})
