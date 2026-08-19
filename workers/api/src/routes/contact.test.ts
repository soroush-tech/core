import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { app } from 'src/app'
import type { Env } from 'src/env'
import { monthTableName } from 'src/utils/tables'
import { contact } from '@soroush.tech/schema'

const valid = {
  name: 'Ada Lovelace',
  company: '',
  email: 'ada@example.com',
  phone: '',
  website: '',
  project: '',
  timeline: '',
  subject: 'Project inquiry',
  message: 'Hello there.',
  consent: true,
}

/** Fake env: D1 records prepared SQL + bound insert args. Email/Turnstile go over `fetch`. */
const makeEnv = (honeypot = 'fax', turnstileSecret = '') => {
  const sqls: string[] = []
  const inserts: unknown[][] = []
  const env = {
    VITE_CONTACT_HONEYPOT: honeypot,
    RESEND_API_KEY: 'test-key',
    TURNSTILE_SECRET: turnstileSecret,
    DB: {
      prepare: (sql: string) => {
        sqls.push(sql)
        return {
          // CREATE TABLE IF NOT EXISTS ... (no bind).
          run: async () => ({}),
          bind: (...args: unknown[]) => ({
            run: async () => {
              inserts.push(args)
              return {}
            },
          }),
        }
      },
    },
    BACKUPS: {},
  } as unknown as Env
  return { env, sqls, inserts }
}

/**
 * Stub the two outbound fetches the route makes: Turnstile siteverify (returns `{ success }`) and
 * the Resend email POST (returns ok/!ok). Returns the requested URLs for assertions.
 */
const stubFetch = ({ turnstileOk = true, emailOk = true, hostname = 'soroush.tech' } = {}) => {
  const urls: string[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string | URL) => {
      const url = String(input)
      urls.push(url)
      if (url.includes('api.resend.com')) {
        return { ok: emailOk, status: emailOk ? 200 : 500 } as Response
      }
      return new Response(JSON.stringify({ success: turnstileOk, hostname }))
    })
  )
  return urls
}

beforeEach(() => {
  stubFetch()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const post = (body: unknown, env: Env, headers: Record<string, string> = {}) =>
  app.request(
    '/v1/contact',
    {
      method: 'POST',
      // An allowed Origin so requests clear the app-level origin guard; the guard itself is
      // covered in app.test.ts.
      headers: { 'Content-Type': 'application/json', Origin: 'https://soroush.tech', ...headers },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    },
    env
  )

describe('POST /v1/contact', () => {
  it('accepts a valid submission, persists it, and emails the owner', async () => {
    const { env, sqls, inserts } = makeEnv()
    const urls = stubFetch()
    const res = await post(valid, env)
    expect(res.status).toBe(200)
    const json = (await res.json()) as { ok: boolean; id: string }
    expect(json.ok).toBe(true)
    // A REQ-YYMM-XXXXXXXX reference is returned, derived from the stored UUID bound into the INSERT.
    expect(json.id).toMatch(/^REQ-\d{4}-[0-9A-F]{8}$/)
    expect(inserts).toHaveLength(1)
    const storedId = inserts[0][0] as string
    expect(json.id.endsWith(storedId.slice(0, 8).toUpperCase())).toBe(true)
    expect(inserts[0]).toContain('ada@example.com')
    expect(urls.some((u) => u.includes('api.resend.com'))).toBe(true)
    // Writes into the current month's partition, creating it first.
    const table = monthTableName(Date.now())
    expect(sqls.some((s) => s.includes(`CREATE TABLE IF NOT EXISTS ${table}`))).toBe(true)
    expect(sqls.some((s) => s.startsWith(`INSERT INTO ${table}`))).toBe(true)
    // GDPR: the exact consent wording is persisted with the row.
    expect(inserts[0]).toContain(contact.consentText)
  })

  it('rejects a submission without consent', async () => {
    const { env, inserts } = makeEnv()
    const res = await post({ ...valid, consent: false }, env)
    expect(res.status).toBe(400)
    expect(inserts).toHaveLength(0)
  })

  it('still succeeds when the email notification fails', async () => {
    const { env, inserts } = makeEnv()
    stubFetch({ emailOk: false })
    const res = await post(valid, env)
    expect(res.status).toBe(200)
    expect((await res.json()) as { ok: boolean }).toMatchObject({ ok: true })
    expect(inserts).toHaveLength(1)
  })

  it('drops a submission whose honeypot field is filled', async () => {
    const { env, inserts } = makeEnv()
    const res = await post({ ...valid, fax: 'i-am-a-bot' }, env)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
    expect(inserts).toHaveLength(0)
  })

  it('ignores an empty honeypot field', async () => {
    const { env } = makeEnv()
    const res = await post({ ...valid, fax: '' }, env)
    expect(res.status).toBe(200)
  })

  it('skips the honeypot when no field name is configured', async () => {
    const { env } = makeEnv('')
    const res = await post(valid, env)
    expect(res.status).toBe(200)
  })

  it('rejects an invalid submission with field errors', async () => {
    const { env, inserts } = makeEnv()
    const res = await post({ ...valid, name: '', email: 'nope' }, env)
    expect(res.status).toBe(400)
    const json = (await res.json()) as { ok: boolean; errors: Record<string, string> }
    expect(json.ok).toBe(false)
    expect(json.errors.name).toBe('Name is required')
    expect(json.errors.email).toBeDefined()
    expect(inserts).toHaveLength(0)
  })

  it('rejects a non-object body without field paths', async () => {
    const { env } = makeEnv()
    const res = await post([], env)
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ ok: false, errors: {} })
  })

  it('rejects a null body without reading honeypot fields', async () => {
    const { env } = makeEnv()
    const res = await post(null, env)
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ ok: false, errors: {} })
  })

  it('rejects a primitive body without reading honeypot fields', async () => {
    const { env } = makeEnv()
    const res = await post(42, env)
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ ok: false, errors: {} })
  })

  it('rejects malformed JSON', async () => {
    const { env } = makeEnv()
    const res = await post('{ not json', env)
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ ok: false, error: 'Invalid JSON' })
  })

  it('rejects an oversized payload before parsing', async () => {
    const { env } = makeEnv()
    const res = await post(valid, env, { 'Content-Length': String(32 * 1024) })
    expect(res.status).toBe(413)
    expect(await res.json()).toEqual({ ok: false, error: 'Payload too large' })
  })
})

describe('POST /v1/contact - Turnstile captcha', () => {
  it('verifies the token and proceeds when verification succeeds', async () => {
    stubFetch({ turnstileOk: true })
    const { env, inserts } = makeEnv('fax', 'secret')
    const res = await post({ ...valid, turnstileToken: 'good' }, env)
    expect(res.status).toBe(200)
    expect((await res.json()) as { ok: boolean }).toMatchObject({ ok: true })
    expect(inserts).toHaveLength(1)
  })

  it('rejects with 403 when verification fails', async () => {
    stubFetch({ turnstileOk: false })
    const { env, inserts } = makeEnv('fax', 'secret')
    const res = await post({ ...valid, turnstileToken: 'bad' }, env)
    expect(res.status).toBe(403)
    expect(await res.json()).toEqual({ ok: false, error: 'Captcha verification failed' })
    expect(inserts).toHaveLength(0)
  })

  it('rejects with 403 when the token is missing', async () => {
    const { env, inserts } = makeEnv('fax', 'secret')
    const res = await post(valid, env)
    expect(res.status).toBe(403)
    expect(inserts).toHaveLength(0)
  })

  it('proceeds when the token is solved on a configured hostname', async () => {
    stubFetch({ turnstileOk: true, hostname: 'soroush.tech' })
    const { env, inserts } = makeEnv('fax', 'secret')
    env.TURNSTILE_HOSTNAME = 'soroush.tech,www.soroush.tech'
    const res = await post({ ...valid, turnstileToken: 'good' }, env)
    expect(res.status).toBe(200)
    expect(inserts).toHaveLength(1)
  })

  it('rejects a token solved on a non-configured hostname', async () => {
    stubFetch({ turnstileOk: true, hostname: 'evil.example' })
    const { env, inserts } = makeEnv('fax', 'secret')
    env.TURNSTILE_HOSTNAME = 'soroush.tech,www.soroush.tech'
    const res = await post({ ...valid, turnstileToken: 'good' }, env)
    expect(res.status).toBe(403)
    expect(inserts).toHaveLength(0)
  })
})
