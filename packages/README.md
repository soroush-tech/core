# packages/

Shared, framework-agnostic workspace packages. Each folder here is its own pnpm package, globbed by `packages/*` in `pnpm-workspace.yaml` and consumed by the apps (and by each other) via `workspace:*`. Anything app-specific stays in `apps/web/`; code lands here only when it is reused by more than one member **or** is meant to be published on its own.

All packages are scoped **`@soroush.tech/*`**, and the directory name matches the package name without the scope (e.g. `packages/vite-plugin-watch` → `@soroush.tech/vite-plugin-watch`).

## What's here

| Package                                | Published | What it does                                                                                            |
| -------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------- |
| `@soroush.tech/eslint-config`          | private   | Shared oxlint config (`.oxlintrc.json`, plus `.react`/`.storybook` layers) every member extends.        |
| `@soroush.tech/vite-plugin-watch`      | private   | Dev-only Vite plugin: re-runs a codegen script on dev start and whenever a watched source file changes. |
| `@soroush.tech/vite-plugin-sitemap`    | private   | Build-only Vite plugin: emits `sitemap.xml` from Vike's prerendered HTML.                               |
| `@soroush.tech/vite-plugin-msw-server` | published | Runs an `msw`/node mock server inside Vite for server-side rendering and SSG prerendering.              |
| `@soroush.tech/playwright-coverage`    | published | Collects per-test V8 coverage from Playwright e2e runs and aggregates it to lcov via monocart.          |
| `@soroush.tech/styled-system`          | published | First-class-TypeScript rewrite of styled-system — the canonical implementation, exposed via subpaths.   |

## Consuming a package

Add it as a `workspace:*` dependency on the member that needs it, then import the **default** export:

```jsonc
// apps/web/package.json
"devDependencies": {
  "@soroush.tech/vite-plugin-msw-server": "workspace:*"
}
```

```ts
import mswServer from '@soroush.tech/vite-plugin-msw-server'
```

Internally, packages are consumed as **TypeScript source** (`exports` → `./src/index.ts`, bundler resolution) — there is no build step for internal use. Publishable packages additionally build a `dist/` with `tsdown` and swap their `exports` to it on publish via `publishConfig`.

## Conventions

Two house rules to know up front:

- **100% test coverage is mandatory** for every package — none ships or publishes below it.
- **Licensing:** a publishable (non-`private`) package must declare a `license` and ship a `LICENSE` file before it is published. _Current state: the published packages above ship MIT; the remaining `private` packages carry no license until they are published._

Full rules — folder structure, exports, publishing, testing, licensing, naming — live in [`packages.md`](./packages.md).
