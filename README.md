# soroush.tech

**Personal portfolio of Masoud Soroush**  
[https://soroush.tech](https://soroush.tech)

This repository is my digital home — a place to share article posts, showcase my
portfolio, and write about web development, tooling, performance, design
systems, and anything else worth sharing as I grow and learn.

It is organized as a **pnpm workspace monorepo**: the website is one app among
its own shared tooling packages and (soon) backend workers.

## 🚀 Getting started

### Prerequisites

- **Node 25** — pinned in [`.nvmrc`](./.nvmrc) (`nvm use`).
- **pnpm 10.13.1** — pinned via the `packageManager` field.

### Install & run

```bash
pnpm install   # installs every workspace (also runs the setup below)
pnpm prepare   # set up all you need — git hooks + per-workspace local env
pnpm dev       # starts the web app dev server
```

`pnpm prepare` runs husky and then each workspace's `setup` (`pnpm -r run setup`):
it bootstraps `apps/web/.env.local` and `workers/api/.env` from their `default.env`
templates (never overwriting an existing file, skipped in CI). It runs automatically
on `pnpm install`; re-run it any time with `pnpm prepare` (or `pnpm run setup`).

---

## 🚦 Status

| Flag                     | Coverage                                                                                                                                                                                                                                               | NPM                                                                                                                                                 | Downloads                                                                                                                                                  | Unpacked size                                                                                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `web:unit`               | [![unit](https://codecov.io/github/soroush-tech/soroush.tech/branch/main/graph/badge.svg?flag=unit&label=unit)](https://codecov.io/github/soroush-tech/soroush.tech?flag=unit)                                                                         | —                                                                                                                                                   | —                                                                                                                                                          | —                                                                                                                                                                         |
| `web:unit:browser`       | [![browser](https://codecov.io/github/soroush-tech/soroush.tech/branch/main/graph/badge.svg?flag=browser&label=browser)](https://codecov.io/github/soroush-tech/soroush.tech?flag=browser)                                                             | —                                                                                                                                                   | —                                                                                                                                                          | —                                                                                                                                                                         |
| `web:storybook`          | [![storybook](https://codecov.io/github/soroush-tech/soroush.tech/branch/main/graph/badge.svg?flag=storybook&label=storybook)](https://codecov.io/github/soroush-tech/soroush.tech?flag=storybook)                                                     | —                                                                                                                                                   | —                                                                                                                                                          | —                                                                                                                                                                         |
| `web:e2e`                | [![e2e](https://codecov.io/github/soroush-tech/soroush.tech/branch/main/graph/badge.svg?flag=e2e&label=e2e)](https://codecov.io/github/soroush-tech/soroush.tech?flag=e2e)                                                                             | —                                                                                                                                                   | —                                                                                                                                                          | —                                                                                                                                                                         |
| `worker:api`             | [![api](https://codecov.io/github/soroush-tech/soroush.tech/branch/main/graph/badge.svg?flag=api&label=api)](https://codecov.io/github/soroush-tech/soroush.tech?flag=api)                                                                             | —                                                                                                                                                   | —                                                                                                                                                          | —                                                                                                                                                                         |
| `bench`                  | [![bench](https://codecov.io/github/soroush-tech/soroush.tech/branch/main/graph/badge.svg?flag=bench&label=bench)](https://codecov.io/github/soroush-tech/soroush.tech?flag=bench)                                                                     | [![npm](https://img.shields.io/npm/v/%40soroush.tech%2Fbench)](https://www.npmjs.com/package/@soroush.tech/bench)                                   | [![downloads](https://img.shields.io/npm/dm/%40soroush.tech%2Fbench)](https://www.npmjs.com/package/@soroush.tech/bench)                                   | [![unpacked size](https://img.shields.io/npm/unpacked-size/%40soroush.tech%2Fbench)](https://www.npmjs.com/package/@soroush.tech/bench)                                   |
| `schema`                 | [![schema](https://codecov.io/github/soroush-tech/soroush.tech/branch/main/graph/badge.svg?flag=schema&label=schema)](https://codecov.io/github/soroush-tech/soroush.tech?flag=schema)                                                                 | —                                                                                                                                                   | —                                                                                                                                                          | —                                                                                                                                                                         |
| `eslint-config`          | [![eslint-config](https://codecov.io/github/soroush-tech/soroush.tech/branch/main/graph/badge.svg?flag=eslint-config&label=eslint-config)](https://codecov.io/github/soroush-tech/soroush.tech?flag=eslint-config)                                     | —                                                                                                                                                   | —                                                                                                                                                          | —                                                                                                                                                                         |
| `vite-plugin-msw-server` | [![vite-plugin-msw-server](https://codecov.io/github/soroush-tech/soroush.tech/branch/main/graph/badge.svg?flag=vite-plugin-msw-server&label=vite-plugin-msw-server)](https://codecov.io/github/soroush-tech/soroush.tech?flag=vite-plugin-msw-server) | [![npm](https://img.shields.io/npm/v/%40soroush.tech%2Fvite-plugin-msw-server)](https://www.npmjs.com/package/@soroush.tech/vite-plugin-msw-server) | [![downloads](https://img.shields.io/npm/dm/%40soroush.tech%2Fvite-plugin-msw-server)](https://www.npmjs.com/package/@soroush.tech/vite-plugin-msw-server) | [![unpacked size](https://img.shields.io/npm/unpacked-size/%40soroush.tech%2Fvite-plugin-msw-server)](https://www.npmjs.com/package/@soroush.tech/vite-plugin-msw-server) |
| `vite-plugin-sitemap`    | [![vite-plugin-sitemap](https://codecov.io/github/soroush-tech/soroush.tech/branch/main/graph/badge.svg?flag=vite-plugin-sitemap&label=vite-plugin-sitemap)](https://codecov.io/github/soroush-tech/soroush.tech?flag=vite-plugin-sitemap)             | —                                                                                                                                                   | —                                                                                                                                                          | —                                                                                                                                                                         |
| `vite-plugin-watch`      | [![vite-plugin-watch](https://codecov.io/github/soroush-tech/soroush.tech/branch/main/graph/badge.svg?flag=vite-plugin-watch&label=vite-plugin-watch)](https://codecov.io/github/soroush-tech/soroush.tech?flag=vite-plugin-watch)                     | —                                                                                                                                                   | —                                                                                                                                                          | —                                                                                                                                                                         |
| `styled-system`          | [![styled-system](https://codecov.io/github/soroush-tech/soroush.tech/branch/main/graph/badge.svg?flag=styled-system&label=styled-system)](https://codecov.io/github/soroush-tech/soroush.tech?flag=styled-system)                                     | [![npm](https://img.shields.io/npm/v/%40soroush.tech%2Fstyled-system)](https://www.npmjs.com/package/@soroush.tech/styled-system)                   | [![downloads](https://img.shields.io/npm/dm/%40soroush.tech%2Fstyled-system)](https://www.npmjs.com/package/@soroush.tech/styled-system)                   | [![unpacked size](https://img.shields.io/npm/unpacked-size/%40soroush.tech%2Fstyled-system)](https://www.npmjs.com/package/@soroush.tech/styled-system)                   |
| `playwright-coverage`    | [![playwright-coverage](https://codecov.io/github/soroush-tech/soroush.tech/branch/main/graph/badge.svg?flag=playwright-coverage&label=playwright-coverage)](https://codecov.io/github/soroush-tech/soroush.tech?flag=playwright-coverage)             | [![npm](https://img.shields.io/npm/v/%40soroush.tech%2Fplaywright-coverage)](https://www.npmjs.com/package/@soroush.tech/playwright-coverage)       | [![downloads](https://img.shields.io/npm/dm/%40soroush.tech%2Fplaywright-coverage)](https://www.npmjs.com/package/@soroush.tech/playwright-coverage)       | [![unpacked size](https://img.shields.io/npm/unpacked-size/%40soroush.tech%2Fplaywright-coverage)](https://www.npmjs.com/package/@soroush.tech/playwright-coverage)       |

---

## 🗂️ Repository layout

```
soroush.tech/
├── apps/
│   └── web/        # The website itself — React 19 + Vike (SSG/SSR)
├── packages/       # Shared, framework-agnostic tooling (@soroush.tech/*)
│   ├── eslint-config
│   ├── vite-plugin-watch
│   ├── vite-plugin-sitemap
│   └── vite-plugin-msw-server
└── workers/        # Backend deployables (Cloudflare Workers) — WIP
```

| Workspace        | What it is                                                                                                                                                          | Details                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| **`apps/web`**   | The production website — pages, design system, sections, hooks, tests.                                                                                              | [apps/web/README.md](./apps/web/README.md) |
| **`packages/*`** | Internal `@soroush.tech/*` tooling extracted from the app — Vite plugins and the shared ESLint base. Nice-to-have, consumed as TypeScript source via `workspace:*`. | [packages/README.md](./packages/README.md) |
| **`workers/*`**  | Backend deployables (APIs, edge functions). Empty for now.                                                                                                          | [workers/README.md](./workers/README.md)   |

Globs live in [`pnpm-workspace.yaml`](./pnpm-workspace.yaml) (`apps/*`,
`packages/*`, `workers/*`).

---

## 🧰 Tech stack — and why

| Area          | Choice                                   | Why                                                                                                   |
| ------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Framework** | React 19 + **Vike** (isomorphic SSG/SSR) | Pre-render every route to static HTML for speed and SEO, while keeping React's component model.       |
| **Build**     | **Vite** 8                               | Fast dev server and an extensible plugin pipeline — the same pipeline our own plugins plug into.      |
| **Styling**   | `@emotion/styled`                        | Token-driven, prop-based styling with a typed design system rather than ad-hoc CSS.                   |
| **Data**      | **TanStack Query** + `axios`             | Declarative server-state with caching.                                                                |
| **Forms**     | **TanStack Form** + **zod**              | Headless, type-safe form state and schema-validated (used by the contact form).                       |
| **Testing**   | **Vitest** + **Playwright** + **MSW**    | Unit/component in Vitest, cross-browser e2e in Playwright, network mocked deterministically with MSW. |
| **UI docs**   | **Storybook** + **Chromatic**            | Component catalogue with visual-regression review on every PR.                                        |
| **Monorepo**  | **pnpm** workspaces                      | Cheap internal packages with `workspace:*` links and no publish step for internal use.                |
| **Packaging** | **tsdown**                               | Builds publishable packages (ESM/CJS + types) without the deprecated config that breaks under TS 6.   |
| **Quality**   | **ESLint** 10 + **Prettier** + husky     | `--max-warnings 0` and a pre-commit gate keep the tree always-green.                                  |

**SEO** is handled at build time: `@soroush.tech/vite-plugin-sitemap` emits
`sitemap.xml` from the prerendered HTML (skipping `noindex` pages), and a
static `robots.txt` ships from `apps/web/public/`.

---

## ✅ Quality & CI/CD

- **Pre-commit** — a husky hook runs lint, format, and tests before each commit.
- **Lint** — `pnpm lint` uses `--max-warnings 0`; any warning fails.
- **Coverage** — touched files reach **100%**, and **every `packages/*` package
  is held at 100%** as a hard threshold.
- **Matrices** — unit/component tests run on Linux · Windows · macOS, and e2e
  runs against Chromium · Firefox · WebKit (3 × 3).
- **Visual regression** — Storybook publishes to **Chromatic** on every PR
  ([live demo](https://main--6a17c33fc4e9466680e34e97.chromatic.com/)).
- **Deploy** — CI success on `main` triggers the CD workflow, which builds with
  production env and deploys to **GitHub Pages**.

Full pipeline detail — with Mermaid diagrams of every workflow — lives in
[`.github/workflows/README.md`](./.github/workflows/README.md) and the
[app README](./apps/web/README.md).

---

## 📚 Documentation

- [.github/workflows/README.md](./.github/workflows/README.md) — CI/CD pipeline explained with Mermaid diagrams.
- [apps/web/README.md](./apps/web/README.md) — the website: structure, scripts, testing.
- [packages/README.md](./packages/README.md) — workspace packages and their conventions.
- [workers/README.md](./workers/README.md) — backend deployables (WIP).
- [CLAUDE.md](./CLAUDE.md) — guidance for AI agents working in this repo.

---

## 📄 License

Custom License — see [LICENSE](./LICENSE.md) for details.

---

## 📬 Contact

**Masoud Soroush**  
Email: [masoud@soroush.tech](mailto:masoud@soroush.tech)  
Website: [soroush.tech](https://soroush.tech)

---

> This project is a personal space to experiment, write, and share ideas.
> Contributions and feedback are welcome if you find something useful or inspiring.
