import { Hono } from 'hono'
import { z } from 'zod'
import type { Env } from 'src/env'
import { OIDC_AUDIENCE, OidcError, verifyActionsOidc } from 'src/services/githubOidc'
import { AppNotInstalledError, mintInstallationToken } from 'src/services/githubApp'
import { BENCH_MARKER, upsertBenchComment } from 'src/services/githubComment'

/** Reject bodies larger than this many bytes before parsing — measured on the received bytes, not the client-supplied `content-length`. */
const MAX_BODY_BYTES = 64 * 1024

export const reportSchema = z.object({
  repository: z.string().regex(/^[\w.-]+\/[\w.-]+$/),
  prNumber: z.number().int().positive(),
  // Only marker-prefixed report bodies are accepted — the relay is not a general commenter.
  body: z.string().startsWith(BENCH_MARKER),
})

export const reportRoute = new Hono<{ Bindings: Env }>()

reportRoute.post('/report', async (c) => {
  const auth = c.req.header('authorization') ?? ''
  if (!auth.startsWith('Bearer ')) {
    return c.json({ ok: false, error: 'Missing bearer token' }, 401)
  }

  const rawBody = await c.req.text()
  if (new TextEncoder().encode(rawBody).length > MAX_BODY_BYTES) {
    return c.json({ ok: false, error: 'Payload too large' }, 413)
  }
  let body: unknown
  try {
    body = JSON.parse(rawBody)
  } catch {
    return c.json({ ok: false, error: 'Invalid JSON' }, 400)
  }
  const parsed = reportSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ ok: false, error: 'Invalid payload' }, 400)
  }

  try {
    // The OIDC `repository` claim is the trusted identity; the payload must agree with it, so a
    // caller can only ever post to its own repo.
    const caller = await verifyActionsOidc(auth.slice('Bearer '.length), OIDC_AUDIENCE)
    if (caller.toLowerCase() !== parsed.data.repository.toLowerCase()) {
      return c.json({ ok: false, error: 'Repository mismatch' }, 401)
    }
    const [owner, repo] = parsed.data.repository.split('/')
    const token = await mintInstallationToken(c.env, owner, repo)
    const commentId = await upsertBenchComment(
      token,
      owner,
      repo,
      parsed.data.prNumber,
      parsed.data.body
    )
    return c.json({ ok: true, commentId })
  } catch (error) {
    if (error instanceof OidcError) return c.json({ ok: false, error: 'Invalid OIDC token' }, 401)
    if (error instanceof AppNotInstalledError) {
      return c.json({ ok: false, error: 'App not installed' }, 404)
    }
    return c.json({ ok: false, error: 'GitHub API error' }, 502)
  }
})
