# Packages

Conventions for everything under `packages/` — the workspace's shared code. Most packages are framework-agnostic tooling; `design-system` is the React component library, and `markdown` is a companion React library that builds on it (a headless markdown editor/renderer). Both React packages follow [`design-system/design-system.md`](./design-system/design-system.md) for component conventions — the `markdown` package's specifics are in [`markdown/markdown.md`](./markdown/markdown.md). Each folder is its own pnpm package, globbed by `packages/*` in `pnpm-workspace.yaml` and consumed by apps (and by each other) via `workspace:*`.

For a plain-English overview of what currently lives here, see [`README.md`](./README.md).

---

## What belongs here

`packages/` is for **shared, app-agnostic code** — framework-agnostic tooling (ESLint config, Vite plugins), shared schemas, generic utilities.

| Belongs in `packages/`                           | Belongs elsewhere                                             |
| ------------------------------------------------ | ------------------------------------------------------------- |
| A Vite plugin reusable across builds             | App-specific sections/pages/hooks → `apps/web/src/`           |
| The shared ESLint base                           | App-specific composed UI → `apps/web/src/common\|section`     |
| UI primitives (`Flex`, `View`) → `design-system` | A single-consumer, app-coupled component → keep it in the app |
| A schema/util shared by two members or published | A single-consumer, app-coupled helper → keep it in the app    |

**A package is justified only when** it is (a) reused by more than one member, or (b) intended to be published on its own. Until then, keep the code in the app — don't pre-extract.

---

## Folder structure

Directory name == package name **minus the `@soroush.tech` scope**.

```
packages/
  package-name/
    src/
      index.ts            ← single entry: the plugin/util + its exported types
      index.test.ts       ← co-located unit tests (100% coverage — required)
    package.json
    tsconfig.json         ← bundler resolution, noEmit; NOT in the root solution
    eslint.config.js      ← spreads @soroush.tech/eslint-config/base + env globals
    vitest.config.ts      ← v8 coverage, reporter ['text', 'lcov'], 100% thresholds
    tsdown.config.ts      ← publishable packages only
    README.md             ← usage docs (publishable packages)
    LICENSE               ← publishable packages
```

Keep the **public API in `index.ts`** (the single entry); extract internal helpers into sibling modules (`filters.ts`, `collector.ts`, …) with co-located `*.test.ts` only once the entry file grows unwieldy — don't pre-split a small, well-factored file. The app-level "one file per helper" rule (CLAUDE.md "Logic & data co-location") is scoped to `common`/`section`/`pages` components, not packages: a package's job is to present one clear entry, so internal structure is an optimization for size, not a default. When `index.ts` does re-export a sibling barrel-style, follow the `export *` rule in the `code-style` skill.

---

## Naming & scope

- Every package is scoped **`@soroush.tech/*`** (apps are not — `apps/web` stays `@soroush/web`).
- A Vite plugin's internal `name` field **must equal its package name minus the scope** (`vite-plugin-watch`), so build logs read `[vite-plugin-watch]`. Keep the directory, package name, and plugin `name` in sync.

---

## Exports

- **Default-export the primary entity** (the plugin factory / main function); export supporting **types as named** exports. This matches the Vite-plugin ecosystem (`import react from '@vitejs/plugin-react'`).

  ```ts
  // src/index.ts
  export interface WatchOptions {
    /* ... */
  }
  export default function watch(opts: WatchOptions): Plugin {
    /* ... */
  }
  ```

  ```ts
  // consumer
  import watch from '@soroush.tech/vite-plugin-watch'
  ```

- Internal (monorepo) consumption is **TypeScript source**: `exports: { ".": "./src/index.ts" }`, consumed under `moduleResolution: bundler` via `workspace:*`. **No `paths` alias, no build step** for internal use.

---

## Publishing

Internal-only packages stay `"private": true` and consume source directly. To make a package publishable:

- Drop `private`; add `version`, `description`, `keywords`, `license`, `author`, `repository.directory`, `homepage`, `files: ["dist"]`.
- Build with **tsdown** (`format: ['esm', 'cjs']`, `dts: true`) → `dist/`. tsdown is preferred over tsup here: it emits declarations via Oxc/Rolldown and does **not** inject the deprecated `baseUrl` that breaks `.d.ts` under TypeScript 6.
- Keep `exports → ./src/index.ts` for the monorepo, and use **`publishConfig`** to swap `exports`/`main`/`module`/`types` to `dist/` **only on publish** — so the app keeps consuming source while npm gets compiled output:

  ```jsonc
  "exports": { ".": "./src/index.ts" },
  "publishConfig": {
    "access": "public",
    "exports": { ".": { "import": { "types": "./dist/index.d.mts", "default": "./dist/index.mjs" },
                        "require": { "types": "./dist/index.d.cts", "default": "./dist/index.cjs" } } },
    "main": "./dist/index.cjs", "module": "./dist/index.mjs", "types": "./dist/index.d.mts"
  }
  ```

- Declare the host framework as a **`peerDependency`** (e.g. `vite`); never bundle the peer.
- `prepublishOnly: pnpm build`; verify the tarball with `pnpm pack` before publishing.

### Releasing to npm — always via pnpm, never `npm publish`

The `publishConfig` → `dist` swap above is a **pnpm feature**. `pnpm pack` / `pnpm publish` rewrite the top-level `exports`/`main`/`module`/`types` to the `dist` targets before packing. **`npm publish` does not** — it ships the raw `exports: "./src/index.ts"`, but the tarball only contains `dist` (`files: ["dist"]`), so **every consumer's `import` fails with `MODULE_NOT_FOUND`** (`.../src/index.ts` not found). A package published this way looks fine in `npm view` metadata but is dead on install.

So release **only** one of these two ways:

1. **CI (preferred)** — dispatch the [`cd-packages.yml`](../.github/workflows/cd-packages.yml) workflow (manual `workflow_dispatch`, main-only, npm Trusted Publishing via OIDC). It runs `pnpm publish`, so the swap is always applied and there is no long-lived token. Add the package to the workflow's `package` choice list first.
2. **Local, only if you must** — from the repo root:

   ```sh
   # bump the version in packages/<name>/package.json first (a version can't be republished)
   pnpm --filter '@soroush.tech/<name>' publish --no-git-checks --otp=<code>
   ```

   `--no-git-checks` is needed off a clean/main branch; quote the `@scope/name` in PowerShell (a bare `@` is the splat operator). **Do not** `cd packages/<name> && npm publish` — that is the exact thing that ships the broken `./src` exports.

**Verify the published artifact, not just the metadata.** Download the real tarball and confirm `exports` resolves to `dist`:

```sh
npm pack '@soroush.tech/<name>@<version>'        # downloads from the registry
tar -xzf soroush.tech-<name>-<version>.tgz -O package/package.json | grep -A3 '"exports"'
# exports must point at ./dist/*, and the tarball must NOT rely on any ./src file
```

If a broken version already went out, you can't overwrite it — **bump, republish with pnpm, then deprecate** the bad ones:

```sh
npm deprecate '@soroush.tech/<name>@<badrange>' 'Broken exports; use >=<fixed>.' --otp=<code>
```

---

## Testing — 100% coverage, no exceptions

**Every package must have 100% test coverage.** No package ships internally or publishes below 100% — this extends the repo-wide rule (CLAUDE.md §6) to the package layer.

- Co-locate `index.test.ts` next to `src/index.ts`; vitest with v8 coverage.
- Every package ships a `vitest.config.ts` with `coverage.reporter: ['text', 'lcov']` (v8 provider, `thresholds: { 100: true }`). The `lcov` reporter is **required** — CI reads each package's `coverage/lcov.info` to rewrite `SF:` paths and upload to Codecov, so a package without it (or relying on vitest's default reporters) breaks the coverage step.
- Each package exposes `test` and `test:coverage` scripts; the root aggregates with `pnpm -r test:coverage`.
- **Register the package with Codecov** so its coverage surfaces and doesn't regress to "No report uploaded". Run `pnpm gen:publish-options` to sync [`.codecov.yml`](../.codecov.yml): it regenerates every package's entry under **both** `flag_management.individual_flags` (which inherits `carryforward: true`, so the badge keeps its last report on commits that don't re-upload the flag) **and** `component_management.individual_components` (`packages/<name>/` for the flag, the `/**` glob for the component). The pre-commit `--check` fails if these drift. Then add a row to the **Coverage** table in the root [`README.md`](../README.md), reusing the existing badge URL shape (`?flag=<name>&label=<name>`). Flag name == component id == directory name.
- Plugin code that depends on the Vite/Rollup runtime is exercised by invoking the exported factory and asserting the returned plugin object's hooks; environment-dependent calls jsdom/node can't run are isolated behind injectable inputs (e.g. the msw server is passed in) so they stay unit-testable.

---

## Licensing

- A **publishable** (non-`private`) package **must** declare a `license` field and ship a `LICENSE` file.
- **Private** internal packages may omit a license while unpublished, but must adopt one before `private` is removed.

---

## Linting & types

- Each package gets a minimal `eslint.config.js` spreading `@soroush.tech/eslint-config/base` plus its environment globals (node, etc.). Tooling packages stay React-free; React-shipping packages (`design-system`) add the react/react-hooks/react-refresh/storybook plugins like the app does.
- `tsconfig.json` uses bundler resolution and `noEmit`. It is **not** referenced by the root solution `tsconfig.json`: packages are typechecked in isolation via `pnpm -r typecheck` and never pulled into the app's TS graph (so a backend/tooling package's types can't leak into the React/DOM build).
