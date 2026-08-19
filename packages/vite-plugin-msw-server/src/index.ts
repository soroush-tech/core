import type { Plugin } from 'vite'

/** How the mock server treats requests with no matching handler. */
export type UnhandledRequestStrategy = 'bypass' | 'warn' | 'error'

/**
 * Minimal structural shape of an msw/node `SetupServerApi`. Declared structurally so this
 * plugin carries no runtime dependency on `msw` - install `msw` in the consuming app and
 * hand the plugin your own server (or a factory that builds one).
 */
export interface MockServer {
  listen(options?: { onUnhandledRequest?: UnhandledRequestStrategy }): void
}

export interface MswServerOptions {
  /**
   * The msw/node server to start, or a factory returning one (sync or async). A factory
   * keeps the mock module out of the config's module graph until the plugin actually
   * runs, so a production build that leaves the plugin disabled never imports `msw`.
   */
  server: MockServer | (() => MockServer | Promise<MockServer>)
  /** Start the server only when `true`; otherwise the plugin is an inert no-op. Default: `true`. */
  enable?: boolean
  /** Forwarded to `server.listen`. Default: `'bypass'`. */
  onUnhandledRequest?: UnhandledRequestStrategy
}

const NAME = 'vite-plugin-msw-server'

/**
 * Starts an msw/node mock server inside the Vite process so that server-side data
 * fetches - SSR `data()` hooks and SSG prerendering - resolve against mocks instead of the
 * live API. `buildStart` covers `vite build`/prerender; `configureServer` covers `vite dev`.
 * Gate it with `enable` (e.g. an env flag) so production builds opt out and never load msw.
 */
export default function mswServer({
  server,
  enable = true,
  onUnhandledRequest = 'bypass',
}: MswServerOptions): Plugin {
  if (!enable) {
    return { name: NAME }
  }

  let started = false
  const start = async () => {
    if (started) return
    started = true
    const instance = typeof server === 'function' ? await server() : server
    instance.listen({ onUnhandledRequest })
  }

  return {
    name: NAME,
    buildStart: start,
    configureServer: start,
  }
}
