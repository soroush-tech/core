// Emotion injects runtime <style> tags, so inline styles must stay allowed.
const BASE_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
]

/**
 * Merges a Content-Security-Policy header into a response's headers.
 * Dev additionally allows the Vite HMR websocket; production stays `'self'`-only.
 */
export function buildCspResponseHeaders(
  responseHeaders: Record<string, string[]> | undefined,
  isDev: boolean
): { responseHeaders: Record<string, string[]> } {
  const directives = isDev ? [...BASE_DIRECTIVES, "connect-src 'self' ws:"] : BASE_DIRECTIVES
  return {
    responseHeaders: {
      ...responseHeaders,
      'Content-Security-Policy': [directives.join('; ')],
    },
  }
}
