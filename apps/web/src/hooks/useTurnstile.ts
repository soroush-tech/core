import { useCallback, useEffect, useRef, useState } from 'react'

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

interface RenderOptions {
  sitekey: string
  callback: (token: string) => void
  'expired-callback': () => void
  'error-callback': () => void
}

interface TurnstileApi {
  render: (container: HTMLElement, options: RenderOptions) => string
  reset: (widgetId: string) => void
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }

  var turnstile: TurnstileApi | undefined
}

/** Inject the Turnstile script once, resolving with the API when it loads - or `undefined` if
 *  the script fails to load (CSP, network, blockers) or loads without exposing the global. The
 *  promise always settles, so a failed load can never leave a caller waiting forever. */
const loadTurnstile = (): Promise<TurnstileApi | undefined> =>
  new Promise((resolve) => {
    if (globalThis.turnstile) {
      resolve(globalThis.turnstile)
      return
    }
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.addEventListener('load', () => resolve(globalThis.turnstile))
    script.addEventListener('error', () => resolve(undefined))
    document.head.appendChild(script)
  })

/**
 * Renders a Cloudflare Turnstile widget into the returned `containerRef` when a `sitekey` is
 * set, and exposes the latest verification `token`. With no sitekey (local/dev) nothing is
 * rendered and `token` stays empty. `reset` clears the token and the widget for a retry. `error`
 * is set when the script can't load, so the caller can surface feedback instead of blocking
 * submission indefinitely.
 */
export function useTurnstile(sitekey: string) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string | undefined>(undefined)
  const [token, setToken] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!sitekey || !container) return

    let active = true
    setError(false)
    void loadTurnstile().then((api) => {
      if (!active) return
      if (api) {
        widgetId.current = api.render(container, {
          sitekey,
          callback: setToken,
          'expired-callback': () => setToken(''),
          'error-callback': () => setToken(''),
        })
      } else {
        setError(true)
      }
    })

    return () => {
      active = false
      if (widgetId.current) {
        globalThis.turnstile?.remove(widgetId.current)
        widgetId.current = undefined
      }
    }
  }, [sitekey])

  const reset = useCallback(() => {
    setToken('')
    if (widgetId.current) globalThis.turnstile?.reset(widgetId.current)
  }, [])

  return { containerRef, token, reset, error }
}
