import { Hono } from 'hono'
import type { Context } from 'hono'
import { contact } from '@soroush.tech/schema'
import type { Env } from 'src/env'
import { notify } from 'src/services/email'
import { verifyTurnstile } from 'src/services/turnstile'
import { monthTableName, createTableStatement } from 'src/utils/tables'
import { sanitizeContact } from 'src/utils/sanitize'
import { formatRequestId } from 'src/utils/requestId'

/** Reject bodies larger than this many bytes before parsing - a cheap abuse guard. */
const MAX_BODY_BYTES = 16 * 1024

/** Honeypot: a filled hidden field (named by env, never in the repo) means a bot. */
const isBot = (record: Record<string, unknown>, field: string | undefined): boolean => {
  const trap = field ? record[field] : undefined
  return typeof trap === 'string' && trap !== ''
}

/** Verify the Turnstile token when a secret is configured. True when no captcha is required. */
const passedCaptcha = async (
  c: Context<{ Bindings: Env }>,
  record: Record<string, unknown>
): Promise<boolean> => {
  if (!c.env.TURNSTILE_SECRET) return true
  const token = record.turnstileToken
  if (typeof token !== 'string') return false
  const ip = c.req.header('cf-connecting-ip')
  const hostnames = (c.env.TURNSTILE_HOSTNAME ?? '')
    .split(',')
    .map((h) => h.trim())
    .filter(Boolean)
  return verifyTurnstile(c.env.TURNSTILE_SECRET, token, ip, hostnames)
}

/** First error message per field, keyed by the top-level path segment. */
const fieldErrors = (
  issues: readonly { path: PropertyKey[]; message: string }[]
): Record<string, string> => {
  const errors: Record<string, string> = {}
  for (const issue of issues) {
    const key = String(issue.path[0] ?? '')
    if (key && !(key in errors)) errors[key] = issue.message
  }
  return errors
}

export const contactRoute = new Hono<{ Bindings: Env }>()

contactRoute.post('/contact', async (c) => {
  if (Number(c.req.header('content-length') ?? '0') > MAX_BODY_BYTES) {
    return c.json({ ok: false, error: 'Payload too large' }, 413)
  }

  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return c.json({ ok: false, error: 'Invalid JSON' }, 400)
  }

  const record = body && typeof body === 'object' ? (body as Record<string, unknown>) : {}

  // Honeypot trip → return success so the bot learns nothing, but do no work.
  if (isBot(record, c.env.VITE_CONTACT_HONEYPOT)) {
    return c.json({ ok: true })
  }

  // Turnstile captcha: when a secret is configured, the token must verify before we proceed.
  if (!(await passedCaptcha(c, record))) {
    return c.json({ ok: false, error: 'Captcha verification failed' }, 403)
  }

  const result = contact.schema.safeParse(body)
  if (!result.success) {
    return c.json({ ok: false, errors: fieldErrors(result.error.issues) }, 400)
  }

  // Strip control characters from the validated values before storing/emailing (HTML is escaped
  // separately at the email sink).
  const v = sanitizeContact(result.data)
  // Partition by month: each submission lands in contacts_YYYY_MM. The cron pre-creates this and
  // next month, but create-if-not-exists here covers the first write of a month either way.
  const now = new Date()
  const table = monthTableName(now)
  const id = crypto.randomUUID()
  await c.env.DB.prepare(createTableStatement(table)).run()
  await c.env.DB.prepare(
    `INSERT INTO ${table}
       (id, created_at, name, company, email, phone, website, project, timeline, subject, message, consent_text)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      now.toISOString(),
      v.name,
      v.company,
      v.email,
      v.phone,
      v.website,
      v.project,
      v.timeline,
      v.subject,
      v.message,
      // GDPR: persist the exact consent wording the user accepted (server-sourced constant).
      contact.consentText
    )
    .run()

  // Email is best-effort: the submission is already persisted, so a send failure must not
  // fail the request.
  try {
    await notify(c.env, v)
  } catch {
    // swallow - the row is stored; the notification can be recovered from D1 if needed.
  }

  // Return a short reference derived from the stored id so the user can quote it in follow-ups.
  return c.json({ ok: true, id: formatRequestId(id, now) })
})
