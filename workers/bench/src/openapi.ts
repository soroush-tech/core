import { z } from 'zod'
import { reportSchema } from 'src/routes/report'
import { BENCH_MARKER } from 'src/services/githubComment'

/** 200 success body: `{ ok: true }`. */
const okResponse = {
  description: 'Success',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: { ok: { type: 'boolean', const: true } },
        required: ['ok'],
      },
    },
  },
}

/** Report 200 body: `{ ok: true, commentId }`. */
const reportOkResponse = {
  description: 'Comment upserted as the bench bot',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          ok: { type: 'boolean', const: true },
          commentId: { type: 'number', description: 'GitHub id of the sticky PR comment.' },
        },
        required: ['ok', 'commentId'],
      },
    },
  },
}

/** Error body: `{ ok: false, error: string }`. */
const errorResponse = (description: string) => ({
  description,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: { ok: { type: 'boolean', const: false }, error: { type: 'string' } },
        required: ['ok', 'error'],
      },
    },
  },
})

/**
 * OpenAPI 3.1 document for `@soroush/bench-api`. The report request body is derived from the
 * route's zod schema via `z.toJSONSchema`, so the docs stay in sync with validation.
 */
export const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: '@soroush/bench-api',
    version: '0.1.0',
    description:
      'bench-action comment relay. Verifies a GitHub Actions OIDC token, mints a GitHub App installation token for the caller repo, and upserts the benchmark results as a sticky PR comment authored by the bench bot.',
  },
  servers: [{ url: '/v1' }],
  components: {
    securitySchemes: {
      oidc: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          "GitHub Actions OIDC token requested with audience 'soroush-bench-action'. Its `repository` claim is the only repo the caller may post to.",
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'Liveness check',
        responses: { '200': okResponse },
      },
    },
    '/report': {
      post: {
        summary: 'Upsert the branded benchmark PR comment',
        security: [{ oidc: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: z.toJSONSchema(reportSchema),
              example: {
                repository: 'soroush-tech/core',
                prNumber: 307,
                body: `${BENCH_MARKER}\n\n## Benchmark results\n\n…`,
              },
            },
          },
        },
        responses: {
          '200': reportOkResponse,
          '400': errorResponse('Invalid JSON or payload (marker missing, bad repository shape)'),
          '401': errorResponse(
            'Missing/invalid OIDC token, or payload repository differs from the verified claim'
          ),
          '404': errorResponse("App not installed on the caller's repository (fallback signal)"),
          '413': errorResponse('Payload too large'),
          '429': errorResponse('Too many requests'),
          '502': errorResponse('GitHub API error'),
        },
      },
    },
  },
}
