[![Typing SVG](https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=700&size=24&duration=2500&pause=800&color=00FC40&center=true&vCenter=true&width=900&lines=Masoud+Soroush;Berlin%2C+Germany)](https://git.io/typing-svg)

<p align="center">
  <a href="https://github.com/soroush-tech/core/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/soroush-tech/core/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://codecov.io/github/soroush-tech/core"><img alt="Coverage" src="https://codecov.io/github/soroush-tech/core/branch/main/graph/badge.svg"></a>
  <a href="https://sonarcloud.io/summary/new_code?id=soroush-tech_soroush.tech"><img alt="Quality Gate" src="https://sonarcloud.io/api/project_badges/measure?project=soroush-tech_soroush.tech&metric=alert_status"></a>
  <a href="https://coderabbit.ai"><img alt="Reviewed by CodeRabbit" src="https://img.shields.io/badge/CodeRabbit-Reviewed-FF570A?logo=coderabbit&logoColor=white"></a>
  <a href="https://storybook.soroush.tech/"><img alt="Storybook" src="https://img.shields.io/badge/Storybook-FF4785?logo=storybook&logoColor=white"></a>
</p>

Welcome to my digital home. 👋

This is where I share what I've learned, showcase what I've built, give back to the
open-source community with tools worth using, and write about performance, design
systems, and the craft of engineering — everything worth sharing as I grow and learn.

Not a static résumé — a living one. Every commit is CI-gated, every touched file hits
**100% coverage**, and the whole thing ships to production on green. What you see is
how I work.

It is organized as a **pnpm workspace monorepo**: the website is one app among
its own shared tooling packages and backend workers.

[https://soroush.tech](https://soroush.tech)

---

<p align="center">
  <a href="https://pagespeed.web.dev/analysis?url=https://soroush.tech"><img alt="Lighthouse Performance" src="https://img.shields.io/badge/Performance-99-success?logo=lighthouse&logoColor=white"></a>
  <a href="https://pagespeed.web.dev/analysis?url=https://soroush.tech"><img alt="Lighthouse Accessibility" src="https://img.shields.io/badge/Accessibility-100-success?logo=lighthouse&logoColor=white"></a>
  <a href="https://pagespeed.web.dev/analysis?url=https://soroush.tech"><img alt="Lighthouse Best Practices" src="https://img.shields.io/badge/Best_Practices-100-success?logo=lighthouse&logoColor=white"></a>
  <a href="https://pagespeed.web.dev/analysis?url=https://soroush.tech"><img alt="Lighthouse SEO" src="https://img.shields.io/badge/SEO-100-success?logo=lighthouse&logoColor=white"></a>
</p>

**SEO** is handled in-house:

- `@soroush.tech/vite-plugin-sitemap` emits
  `sitemap.xml` from the prerendered HTML (skipping `noindex` pages).
- a static `robots.txt` ships from `apps/web/public/` at build time.
- meta-tags are injected for each page.

---

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
it bootstraps `.env.local` from their `default.env` It runs automatically
on `pnpm install`; re-run it any time with `pnpm prepare` (or `pnpm run setup`).

---

## 📚 Documentation

- [.github/workflows/README.md](./.github/workflows/README.md) — CI/CD pipeline explained with Mermaid diagrams.
- [apps/web/README.md](./apps/web/README.md) — the website: structure, scripts, testing.
- [packages/README.md](./packages/README.md) — workspace packages.
- [workers/README.md](./workers/README.md) — backend.

---

## 🚦 Status

| Area                             | Coverage                                                                                                                                                                                                                               | NPM                                                                                                                                                                    | Downloads                                                                                                                                                                     | Unpacked size                                                                                                                                                                                |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `web`                            | [![web](https://codecov.io/github/soroush-tech/core/branch/main/graph/badge.svg?flag=web&label=web)](https://codecov.io/github/soroush-tech/core?flag=web)                                                                             | —                                                                                                                                                                      | —                                                                                                                                                                             | —                                                                                                                                                                                            |
| `web:unit`                       | [![unit](https://codecov.io/github/soroush-tech/core/branch/main/graph/badge.svg?flag=unit&label=unit)](https://codecov.io/github/soroush-tech/core?flag=unit)                                                                         | —                                                                                                                                                                      | —                                                                                                                                                                             | —                                                                                                                                                                                            |
| `web:unit:browser`               | [![browser](https://codecov.io/github/soroush-tech/core/branch/main/graph/badge.svg?flag=browser&label=browser)](https://codecov.io/github/soroush-tech/core?flag=browser)                                                             | —                                                                                                                                                                      | —                                                                                                                                                                             | —                                                                                                                                                                                            |
| `web:storybook`                  | [![storybook](https://codecov.io/github/soroush-tech/core/branch/main/graph/badge.svg?flag=storybook&label=storybook)](https://codecov.io/github/soroush-tech/core?flag=storybook)                                                     | —                                                                                                                                                                      | —                                                                                                                                                                             | —                                                                                                                                                                                            |
| `web:e2e`                        | [![e2e](https://codecov.io/github/soroush-tech/core/branch/main/graph/badge.svg?flag=e2e&label=e2e)](https://codecov.io/github/soroush-tech/core?flag=e2e)                                                                             | —                                                                                                                                                                      | —                                                                                                                                                                             | —                                                                                                                                                                                            |
| `worker:api`                     | [![api](https://codecov.io/github/soroush-tech/core/branch/main/graph/badge.svg?flag=api&label=api)](https://codecov.io/github/soroush-tech/core?flag=api)                                                                             | —                                                                                                                                                                      | —                                                                                                                                                                             | —                                                                                                                                                                                            |
| `package:bench`                  | [![bench](https://codecov.io/github/soroush-tech/core/branch/main/graph/badge.svg?flag=bench&label=bench)](https://codecov.io/github/soroush-tech/core?flag=bench)                                                                     | [![npm](https://img.shields.io/npm/v/%40soroush.tech%2Fbench?cacheSeconds=86400)](https://www.npmjs.com/package/@soroush.tech/bench)                                   | [![downloads](https://img.shields.io/npm/dm/%40soroush.tech%2Fbench?cacheSeconds=86400)](https://www.npmjs.com/package/@soroush.tech/bench)                                   | [![unpacked size](https://img.shields.io/npm/unpacked-size/%40soroush.tech%2Fbench?cacheSeconds=86400)](https://www.npmjs.com/package/@soroush.tech/bench)                                   |
| `package:vite-plugin-msw-server` | [![vite-plugin-msw-server](https://codecov.io/github/soroush-tech/core/branch/main/graph/badge.svg?flag=vite-plugin-msw-server&label=vite-plugin-msw-server)](https://codecov.io/github/soroush-tech/core?flag=vite-plugin-msw-server) | [![npm](https://img.shields.io/npm/v/%40soroush.tech%2Fvite-plugin-msw-server?cacheSeconds=86400)](https://www.npmjs.com/package/@soroush.tech/vite-plugin-msw-server) | [![downloads](https://img.shields.io/npm/dm/%40soroush.tech%2Fvite-plugin-msw-server?cacheSeconds=86400)](https://www.npmjs.com/package/@soroush.tech/vite-plugin-msw-server) | [![unpacked size](https://img.shields.io/npm/unpacked-size/%40soroush.tech%2Fvite-plugin-msw-server?cacheSeconds=86400)](https://www.npmjs.com/package/@soroush.tech/vite-plugin-msw-server) |
| `package:vite-plugin-sitemap`    | [![vite-plugin-sitemap](https://codecov.io/github/soroush-tech/core/branch/main/graph/badge.svg?flag=vite-plugin-sitemap&label=vite-plugin-sitemap)](https://codecov.io/github/soroush-tech/core?flag=vite-plugin-sitemap)             | —                                                                                                                                                                      | —                                                                                                                                                                             | —                                                                                                                                                                                            |
| `package:vite-plugin-watch`      | [![vite-plugin-watch](https://codecov.io/github/soroush-tech/core/branch/main/graph/badge.svg?flag=vite-plugin-watch&label=vite-plugin-watch)](https://codecov.io/github/soroush-tech/core?flag=vite-plugin-watch)                     | —                                                                                                                                                                      | —                                                                                                                                                                             | —                                                                                                                                                                                            |
| `package:styled-system`          | [![styled-system](https://codecov.io/github/soroush-tech/core/branch/main/graph/badge.svg?flag=styled-system&label=styled-system)](https://codecov.io/github/soroush-tech/core?flag=styled-system)                                     | [![npm](https://img.shields.io/npm/v/%40soroush.tech%2Fstyled-system?cacheSeconds=86400)](https://www.npmjs.com/package/@soroush.tech/styled-system)                   | [![downloads](https://img.shields.io/npm/dm/%40soroush.tech%2Fstyled-system?cacheSeconds=86400)](https://www.npmjs.com/package/@soroush.tech/styled-system)                   | [![unpacked size](https://img.shields.io/npm/unpacked-size/%40soroush.tech%2Fstyled-system?cacheSeconds=86400)](https://www.npmjs.com/package/@soroush.tech/styled-system)                   |
| `package:playwright-coverage`    | [![playwright-coverage](https://codecov.io/github/soroush-tech/core/branch/main/graph/badge.svg?flag=playwright-coverage&label=playwright-coverage)](https://codecov.io/github/soroush-tech/core?flag=playwright-coverage)             | [![npm](https://img.shields.io/npm/v/%40soroush.tech%2Fplaywright-coverage?cacheSeconds=86400)](https://www.npmjs.com/package/@soroush.tech/playwright-coverage)       | [![downloads](https://img.shields.io/npm/dm/%40soroush.tech%2Fplaywright-coverage?cacheSeconds=86400)](https://www.npmjs.com/package/@soroush.tech/playwright-coverage)       | [![unpacked size](https://img.shields.io/npm/unpacked-size/%40soroush.tech%2Fplaywright-coverage?cacheSeconds=86400)](https://www.npmjs.com/package/@soroush.tech/playwright-coverage)       |
| `package:design-system`          | [![design-system](https://codecov.io/github/soroush-tech/core/branch/main/graph/badge.svg?flag=design-system&label=design-system)](https://codecov.io/github/soroush-tech/core?flag=design-system)                                     | [![npm](https://img.shields.io/npm/v/%40soroush.tech%2Fdesign-system?cacheSeconds=86400)](https://www.npmjs.com/package/@soroush.tech/design-system)                   | [![downloads](https://img.shields.io/npm/dm/%40soroush.tech%2Fdesign-system?cacheSeconds=86400)](https://www.npmjs.com/package/@soroush.tech/design-system)                   | [![unpacked size](https://img.shields.io/npm/unpacked-size/%40soroush.tech%2Fdesign-system?cacheSeconds=86400)](https://www.npmjs.com/package/@soroush.tech/design-system)                   |
| `package:markdown`               | [![markdown](https://codecov.io/github/soroush-tech/core/branch/main/graph/badge.svg?flag=markdown&label=markdown)](https://codecov.io/github/soroush-tech/core?flag=markdown)                                                         | [![npm](https://img.shields.io/npm/v/%40soroush.tech%2Fmarkdown?cacheSeconds=86400)](https://www.npmjs.com/package/@soroush.tech/markdown)                             | [![downloads](https://img.shields.io/npm/dm/%40soroush.tech%2Fmarkdown?cacheSeconds=86400)](https://www.npmjs.com/package/@soroush.tech/markdown)                             | [![unpacked size](https://img.shields.io/npm/unpacked-size/%40soroush.tech%2Fmarkdown?cacheSeconds=86400)](https://www.npmjs.com/package/@soroush.tech/markdown)                             |

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

| Area              | Choice                                | Why                                                                                                    |
| ----------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Quality**       | **SonarQube** + **CodeRabbit**        | Static analysis for bugs, smells, and security, plus AI-assisted code review on every PR.              |
| **Framework**     | React 19 (Isomorphic, SSG, SSR)       | Pre-render every route to static HTML for speed and SEO, while keeping React's component model.        |
| **Build**         | **Vite** 8                            | Fast dev server and an extensible plugin pipeline — the same pipeline our own plugins plug into.       |
| **UI docs**       | **Storybook** + **Chromatic**         | Component catalogue with visual-regression review on every PR.                                         |
| **Monorepo**      | **pnpm** workspaces                   | Cheap internal packages with `workspace:*` links and no publish step for internal use.                 |
| **Packaging**     | **tsdown**                            | Builds publishable packages (ESM/CJS + types) without the deprecated config that breaks under TS 6.    |
| **Lint & format** | **ESLint** 10 + **Prettier** + husky  | `--max-warnings 0` and a pre-commit gate keep the tree always-green.                                   |
| **Styling**       | `@emotion/styled`                     | Token-driven, prop-based styling with a typed design system rather than ad-hoc CSS.                    |
| **Data**          | **TanStack Query**                    | Declarative server-state with caching.                                                                 |
| **Forms**         | **TanStack Form** + **zod**           | Headless, type-safe form state and schema-validated (used by the contact form).                        |
| **Backend**       | **Hono** on **Cloudflare Workers**    | Type-safe edge API with OpenAPI docs (`@hono/swagger-ui`), backed by **D1** and deployed via Wrangler. |
| **Testing**       | **Vitest** + **Playwright** + **MSW** | Unit/component in Vitest, cross-browser e2e in Playwright, network mocked deterministically with MSW.  |

---

## 📬 Contact

**Masoud Soroush**  
Email: [masoud@soroush.tech](mailto:masoud@soroush.tech)  
Website: [soroush.tech](https://soroush.tech)

---

> This project is a personal space to experiment, write, and share ideas.
> Contributions and feedback are welcome if you find something useful or inspiring.
