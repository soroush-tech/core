# @soroush.tech/vite-plugin-msw-server

[![npm version](https://img.shields.io/npm/v/@soroush.tech/vite-plugin-msw-server.svg)](https://www.npmjs.com/package/@soroush.tech/vite-plugin-msw-server)
[![npm downloads](https://img.shields.io/npm/dm/@soroush.tech/vite-plugin-msw-server.svg)](https://www.npmjs.com/package/@soroush.tech/vite-plugin-msw-server)
[![coverage](https://codecov.io/gh/soroush-tech/soroush.tech/branch/main/graph/badge.svg?flag=vite-plugin-msw-server)](https://app.codecov.io/gh/soroush-tech/soroush.tech?flags%5B0%5D=vite-plugin-msw-server)
[![unpacked size](https://img.shields.io/npm/unpacked-size/@soroush.tech/vite-plugin-msw-server.svg)](https://www.npmjs.com/package/@soroush.tech/vite-plugin-msw-server)
[![types included](https://img.shields.io/npm/types/@soroush.tech/vite-plugin-msw-server.svg)](https://www.npmjs.com/package/@soroush.tech/vite-plugin-msw-server)
[![license](https://img.shields.io/npm/l/@soroush.tech/vite-plugin-msw-server.svg)](./LICENSE)

A Vite plugin that starts an [msw/node](https://mswjs.io/docs/integrations/node) mock server inside the Vite
process, so **server-side** data fetching resolves against your mocks during:

- `vite dev` (SSR `data()` hooks), and
- `vite build` (SSG **prerendering**).

It mirrors the browser-side msw worker for the server: deterministic prerenders and SSR in
tests, without touching the live API. The plugin has **no runtime dependency on msw** — you
own the `msw` install and pass your server in, so it stays decoupled from your mock setup.

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

Both happen **inside the Vite/Node process**, which is exactly where the plugin's
`msw/node` server lives (it starts on `buildStart` for builds and `configureServer` for
dev). That is the whole scope:

> ✅ dev-time SSR and build-time SSG/prerender — ❌ **not** your deployed production server.

At runtime in production, Vite isn't running, so the plugin isn't either. That's by
design — keep `enable` off for production builds (and because `server` is a factory, msw
is never even imported when disabled).

### Suitable platforms

- **Frameworks:** any **Vite-powered** SSR/SSG setup where server-side fetching runs in the
  Vite/Node process — [Vike](https://vike.dev), [Astro](https://astro.build),
  [SvelteKit](https://kit.svelte.dev), [Nuxt](https://nuxt.com),
  [Remix (Vite)](https://remix.run), or vanilla Vite SSR.
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
`'warn'` or `'error'` to surface requests that fall through with no handler.

**Which Node versions are supported?**
Any Node that your msw version supports. `msw/node` hooks Node's HTTP layer, so it runs
under Node.js for dev, CI, and builds.
