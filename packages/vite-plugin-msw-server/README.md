# @soroush.tech/vite-plugin-msw-server

[![npm version](https://img.shields.io/npm/v/@soroush.tech/vite-plugin-msw-server.svg)](https://www.npmjs.com/package/@soroush.tech/vite-plugin-msw-server)
[![npm downloads](https://img.shields.io/npm/dm/@soroush.tech/vite-plugin-msw-server.svg)](https://www.npmjs.com/package/@soroush.tech/vite-plugin-msw-server)
[![coverage](https://codecov.io/gh/soroush-tech/soroush.tech/branch/main/graph/badge.svg?flag=vite-plugin-msw-server)](https://app.codecov.io/gh/soroush-tech/soroush.tech?flags%5B0%5D=vite-plugin-msw-server)
[![unpacked size](https://img.shields.io/npm/unpacked-size/@soroush.tech/vite-plugin-msw-server.svg)](https://www.npmjs.com/package/@soroush.tech/vite-plugin-msw-server)
[![types included](https://img.shields.io/npm/types/@soroush.tech/vite-plugin-msw-server.svg)](https://www.npmjs.com/package/@soroush.tech/vite-plugin-msw-server)
[![license](https://img.shields.io/npm/l/@soroush.tech/vite-plugin-msw-server.svg)](./LICENSE)

> ### 🎭 Made for end-to-end tests
>
> **Mock the server side of your app in your e2e suite.** Point Playwright or Cypress at
> `vite dev` (or a prerendered build) and your SSR data loaders resolve against
> [msw](https://mswjs.io) handlers instead of a live API — **no network flake, no seeded
> backend, reproducible in CI**. → [Testing with Playwright](#testing-with-playwright)

A Vite plugin that starts an [msw/node](https://mswjs.io/docs/integrations/node) mock server
inside the Vite process, so **server-side** data fetching resolves against your mocks during
`vite dev` (SSR `data()` hooks) and `vite build` (SSG **prerendering**) — the rendering that
happens in Node, where msw's browser worker can't reach.

It mirrors the browser-side msw worker for the server. The plugin has **no runtime dependency
on msw** — you own the `msw` install and pass your server in, so it stays decoupled from your
mock setup.

## Install

```sh
# npm
npm install -D @soroush.tech/vite-plugin-msw-server msw
```

```sh
# pnpm
pnpm add -D @soroush.tech/vite-plugin-msw-server msw
```

```sh
# yarn
yarn add -D @soroush.tech/vite-plugin-msw-server msw
```

`vite` is a peer dependency (`^6 || ^7 || ^8`) and `msw` is yours to install — the plugin
carries neither at runtime.

## Usage

Gate it behind an env flag so production builds opt out and never load msw:

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import mswServer from '@soroush.tech/vite-plugin-msw-server'

const mockServerEnabled = process.env.VITE_APP_MSW_ACTIVE === 'true'

export default defineConfig({
  plugins: [
    mswServer({
      enable: mockServerEnabled,
      // Factory ⇒ the mock module is only imported when the plugin actually runs.
      server: () => import('./src/test/mocks/server').then((m) => m.server),
    }),
  ],
})
```

Where `./src/test/mocks/server` is your own:

```ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

## Testing with Playwright

Start `vite dev` (or `vite preview` on a prerendered build) with the mock flag on and point
Playwright at it — SSR resolves against your handlers, so tests never hit a live API:

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  webServer: {
    command: 'vite dev',
    env: { VITE_APP_MSW_ACTIVE: 'true' },
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

## Options

| Option               | Type                                                      | Default    | Description                                                                         |
| -------------------- | --------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------- |
| `server`             | `MockServer \| (() => MockServer \| Promise<MockServer>)` | —          | An msw/node server, or a factory returning one. Use a factory to keep imports lazy. |
| `enable`             | `boolean`                                                 | `true`     | When `false`, the plugin is an inert no-op.                                         |
| `onUnhandledRequest` | `'bypass' \| 'warn' \| 'error'`                           | `'bypass'` | Forwarded to `server.listen`.                                                       |

## Server-side rendering & static generation

This plugin exists for the **server side** of a Vite app — the rendering that happens in
Node, where msw's browser worker can't reach. Two flavors:

- **SSR (Server-Side Rendering)** — HTML is rendered on a server. During `vite dev`, your
  SSR entry runs _inside the Vite dev server_ (a Node process), and any server-side data
  fetching (route loaders, `data()` hooks) hits your **real API** by default. The plugin
  intercepts those fetches and answers them from your handlers instead.
- **SSG / prerendering (Static Site Generation)** — during `vite build`, pages are
  rendered once at build time into static HTML. The same server-side fetching runs in the
  **build process**. The plugin makes that deterministic: prerendering resolves against
  mocks, so your static output never depends on a live API being reachable at build time.
  This holds when the framework prerenders **inside the Vite build** (Astro, Vike, vanilla
  Vite SSR). Some frameworks prerender in a separate process (SvelteKit, Nuxt) — there the
  build step isn't covered even though `vite dev` is. See the [support matrix](#framework-support).

Both happen **inside the Vite/Node process**, which is exactly where the plugin's
`msw/node` server lives (it starts on `buildStart` for builds and `configureServer` for
dev). That is the whole scope:

> ✅ dev-time SSR and build-time SSG/prerender — ❌ **not** your deployed production server.

At runtime in production, Vite isn't running, so the plugin isn't either. That's by
design — keep `enable` off for production builds (and because `server` is a factory, msw
is never even imported when disabled).

### Framework support

The plugin only affects requests made **in the same process as Vite**. Whether that covers
your SSR/prerender depends on where the framework runs them:

| Framework                           | `vite dev` (SSR) | `vite build` (SSG) | Notes                                                                 |
| ----------------------------------- | :--------------: | :----------------: | --------------------------------------------------------------------- |
| [Astro](https://astro.build)        |        ✅        |         ✅         | prerender runs inside the Vite build                                  |
| [Vike](https://vike.dev)            |        ✅        |         ✅         | prerender runs inside the Vite build                                  |
| vanilla Vite SSR                    |        ✅        |         ✅         | when your prerender runs in the build process                         |
| [SvelteKit](https://kit.svelte.dev) |        ✅        |         ❌         | prerender runs in a separate process                                  |
| [Remix (Vite)](https://remix.run)   |        ✅        |         —          | no built-in prerender; prod is `remix-serve`                          |
| [Nuxt](https://nuxt.com)            |        ❌        |         ❌         | Nitro SSR is a separate process — start msw in a Nitro plugin instead |
| [Next.js](https://nextjs.org)       |        ❌        |         ❌         | not Vite-based — use msw via `instrumentation.ts`                     |

Runnable examples for the supported frameworks — [Astro][ex-astro], [Vike][ex-vike],
[SvelteKit][ex-sveltekit], and [Remix][ex-remix] — live in the
[examples repo](https://github.com/soroush-tech/examples/tree/main/vite-plugin-msw-server).

[ex-astro]: https://github.com/soroush-tech/examples/tree/main/vite-plugin-msw-server/astro
[ex-vike]: https://github.com/soroush-tech/examples/tree/main/vite-plugin-msw-server/vike
[ex-sveltekit]: https://github.com/soroush-tech/examples/tree/main/vite-plugin-msw-server/sveltekit
[ex-remix]: https://github.com/soroush-tech/examples/tree/main/vite-plugin-msw-server/remix

- **Runtime:** **Node.js** — `msw/node` intercepts Node's HTTP layer, so it works in local
  dev, CI, and the build. Edge/Workers production runtimes are **not** a target (and don't
  need to be — the plugin is dev/build-time only).
- **Pairs with:** the msw **browser** worker (`setupWorker`) for client-side requests. This
  plugin covers the server half; together they mock both sides of an isomorphic app.

## FAQ

**Does this run in production?**
No. It only runs inside `vite dev` and the `vite build` prerender step. Gate it with
`enable` so production builds skip it; your deployed runtime never includes the plugin or
msw.

**Does it mock requests in the browser?**
No — it's server-side only (`msw/node`). It covers SSR loaders and SSG prerendering. For
client-side mocking, run msw's browser worker (`setupWorker`) separately. The two are
complementary: this plugin mirrors the browser worker on the server.

**Why doesn't the plugin depend on msw?**
So it stays decoupled from your mock setup and msw version. You install `msw` and pass your
own `setupServer(...)` instance (or a factory). The plugin only needs the structural
`listen()` shape — nothing more.

**Why pass a factory instead of the server directly?**
A factory (`() => import('./mocks/server')`) keeps the mock module out of the config's
module graph until the plugin actually runs. A production build with `enable: false` then
never imports msw or your handlers.

**My server-side requests aren't being mocked — what should I check?**
Confirm `enable` is `true`, that your fetching happens in the Node process (not a separate
edge runtime), and that the request has a matching handler. Set `onUnhandledRequest` to
`'warn'` or `'error'` to surface requests that fall through with no handler. Also confirm your
framework renders **in the Vite process** — if SSR or prerender runs in a separate process
(SvelteKit build, Nuxt/Nitro), the plugin can't reach it; see the
[support matrix](#framework-support).

**Does it work with Nuxt?**
No. Nuxt's SSR runs in a separate Nitro process, so the plugin — which lives in the Vite
process — can't intercept those requests. Start msw from a Nitro plugin instead.

**Does it work with SvelteKit or Remix?**
Dev-time SSR, yes. Their production and prerender steps run outside the Vite process
(SvelteKit prerenders separately; Remix serves via `remix-serve`), so the build isn't covered.
See the [support matrix](#framework-support).

**Which Node versions are supported?**
Any Node that your msw version supports. `msw/node` hooks Node's HTTP layer, so it runs
under Node.js for dev, CI, and builds.
