import { buildCspResponseHeaders } from './csp'

describe('buildCspResponseHeaders', () => {
  it('sets a self-restricted policy in production', () => {
    const { responseHeaders } = buildCspResponseHeaders(undefined, false)
    const [policy] = responseHeaders['Content-Security-Policy']
    expect(policy).toContain("default-src 'self'")
    expect(policy).toContain("script-src 'self'")
    expect(policy).not.toContain('ws:')
  })

  it('allows the Vite HMR websocket in dev', () => {
    const { responseHeaders } = buildCspResponseHeaders(undefined, true)
    const [policy] = responseHeaders['Content-Security-Policy']
    expect(policy).toContain("connect-src 'self' ws:")
  })

  it('preserves the existing response headers', () => {
    const { responseHeaders } = buildCspResponseHeaders({ 'X-Existing': ['kept'] }, false)
    expect(responseHeaders['X-Existing']).toEqual(['kept'])
    expect(responseHeaders['Content-Security-Policy']).toHaveLength(1)
  })
})
