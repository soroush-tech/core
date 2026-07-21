import { Hono } from 'hono'
import { swaggerUI } from '@hono/swagger-ui'
import type { Env } from './env'
import { reportRoute } from 'src/routes/report'
import { openApiDocument } from './openapi'

/**
 * Paths exempt from the rate limit: `/health` (uptime monitors poll frequently) and the docs
 * routes (already gated by `DOCS_ENABLED`, never served in production).
 */
const RATE_EXEMPT = new Set(['/v1/health', '/v1/docs', '/v1/openapi.json'])

/** Docs (Swagger UI + OpenAPI) are served only when `DOCS_ENABLED` is set — never in production. */
const docsEnabled = (c: { env: Env }) => c.env.DOCS_ENABLED === 'true'

/**
 * Builds the `@soroush/bench-api` Hono app — the bench-action comment relay. All routes live
 * under `/v1`. Unlike `@soroush/api` there is no CORS/origin guard: the callers are CI runners,
 * not browsers, and every report request authenticates with a GitHub Actions OIDC JWT instead.
 */
export const createApp = () => {
  const app = new Hono<{ Bindings: Env }>().basePath('/v1')

  // Per-IP rate limit across all routes. `cf-connecting-ip` is always set behind Cloudflare;
  // it's absent only in local dev / direct access, where we skip rather than block.
  app.use('/*', async (c, next) => {
    if (RATE_EXEMPT.has(c.req.path)) return next()
    const ip = c.req.header('cf-connecting-ip')
    if (ip) {
      const { success } = await c.env.RATE_LIMITER.limit({ key: ip })
      if (!success) return c.json({ ok: false, error: 'Too many requests' }, 429)
    }
    return next()
  })

  app.get('/health', (c) => c.json({ ok: true }))
  app.route('/', reportRoute)

  // API docs — gated so production (where DOCS_ENABLED is unset) returns 404.
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
