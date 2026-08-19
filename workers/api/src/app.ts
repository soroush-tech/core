import { Hono } from 'hono'
import type { Context } from 'hono'
import { cors } from 'hono/cors'
import { swaggerUI } from '@hono/swagger-ui'
import type { Env } from './env'
import { contactRoute } from 'src/routes/contact'
import { openApiDocument } from './openapi'

/** Only the production site (apex + www) may call the API from a browser. */
const ALLOWED_ORIGINS = ['https://soroush.tech', 'https://www.soroush.tech']

/**
 * CORS origin check: always allow the production origins, plus a single local web origin when
 * `ALLOW_ORIGIN` is set. `ALLOW_ORIGIN` is supplied only via the local `workers/api/.env` and is
 * never configured in production, so localhost can never be granted in a deployed Worker.
 */
const resolveOrigin = (origin: string, c: Context<{ Bindings: Env }>) =>
  ALLOWED_ORIGINS.includes(origin) || origin === c.env.ALLOW_ORIGIN ? origin : null

/**
 * Paths exempt from the origin guard and rate limit: `/health` (uptime monitors send no Origin and
 * poll frequently) and the docs routes (opened by direct browser navigation, which also sends no
 * Origin; already gated by `DOCS_ENABLED`).
 */
const GUARD_EXEMPT = new Set(['/v1/health', '/v1/docs', '/v1/openapi.json'])

/** Origin of a `Referer` header, or `null` when it's absent or unparseable. */
const refererOrigin = (referer: string | undefined): string | null => {
  if (!referer) return null
  try {
    return new URL(referer).origin
  } catch {
    return null
  }
}

/** Docs (Swagger UI + OpenAPI) are served only when `DOCS_ENABLED` is set - never in production. */
const docsEnabled = (c: { env: Env }) => c.env.DOCS_ENABLED === 'true'

/**
 * Builds the `@soroush/api` Hono app. All routes live under `/v1`. CORS is locked to the
 * production origins (plus the dev origin when configured).
 */
export const createApp = () => {
  const app = new Hono<{ Bindings: Env }>().basePath('/v1')

  app.use(
    '/*',
    cors({
      origin: resolveOrigin,
      allowMethods: ['POST', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
    })
  )

  // Belt-and-suspenders origin gate: reject requests whose Origin (or Referer, as a fallback) is
  // not our site before they reach a route. Non-browser clients can forge these headers, so this
  // is noise reduction, not security - Turnstile is the real gate. `cors()` above already
  // short-circuits the OPTIONS preflight, so only real requests reach here.
  app.use('/*', async (c, next) => {
    if (GUARD_EXEMPT.has(c.req.path)) return next()
    const allowed = c.env.ALLOW_ORIGIN ? [...ALLOWED_ORIGINS, c.env.ALLOW_ORIGIN] : ALLOWED_ORIGINS
    const origin = c.req.header('Origin')
    const allowedByOrigin = origin ? allowed.includes(origin) : false
    const allowedByReferer = allowed.includes(refererOrigin(c.req.header('Referer')) ?? '')
    if (!allowedByOrigin && !allowedByReferer) {
      return c.json({ ok: false, error: 'Forbidden' }, 403)
    }
    return next()
  })

  // Per-IP rate limit across all routes. `cf-connecting-ip` is always set behind Cloudflare; it's
  // absent only in local dev / direct access, where we skip rather than block.
  app.use('/*', async (c, next) => {
    if (GUARD_EXEMPT.has(c.req.path)) return next()
    const ip = c.req.header('cf-connecting-ip')
    if (ip) {
      const { success } = await c.env.RATE_LIMITER.limit({ key: ip })
      if (!success) return c.json({ ok: false, error: 'Too many requests' }, 429)
    }
    return next()
  })

  app.get('/health', (c) => c.json({ ok: true }))
  app.route('/', contactRoute)

  // API docs - gated so production (where DOCS_ENABLED is unset) returns 404.
  app.use('/openapi.json', async (c, next) => {
    if (!docsEnabled(c)) return c.notFound()
    await next()
  })
  app.use('/docs', async (c, next) => {
    if (!docsEnabled(c)) return c.notFound()
    await next()
  })
  app.get('/openapi.json', (c) => c.json(openApiDocument))
  app.get('/docs', swaggerUI({ url: '/v1/openapi.json' }))

  return app
}

export const app = createApp()
