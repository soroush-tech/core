// Emotion injects runtime <style> tags, so inline styles must stay allowed.
const BASE_DIRECTIVES = [
  "default-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
]

const PROD_DIRECTIVES = ["script-src 'self'"]

// Dev needs the inline react-refresh preamble @vitejs/plugin-react injects into
// index.html (blocking it leaves a white window) and the Vite HMR websocket.
const DEV_DIRECTIVES = ["script-src 'self' 'unsafe-inline'", "connect-src 'self' ws:"]

/**
 * Merges a Content-Security-Policy header into a response's headers.
 * Dev additionally allows Vite's inline refresh preamble and HMR websocket;
 * production stays `'self'`-only.
 */
export function buildCspResponseHeaders(
  responseHeaders: Record<string, string[]> | undefined,
  isDev: boolean
): { responseHeaders: Record<string, string[]> } {
  const directives = [...BASE_DIRECTIVES, ...(isDev ? DEV_DIRECTIVES : PROD_DIRECTIVES)]
  return {
    responseHeaders: {
      ...responseHeaders,
      'Content-Security-Policy': [directives.join('; ')],
    },
  }
}
