# @soroush/web

The **soroush.tech** website — a React 19 + **Vike** app, prerendered to static
HTML (SSG) with an isomorphic render path. This is the `apps/web` workspace of
the [soroush.tech monorepo](../../README.md).

---

## ✨ Features

- **React 19** + **Vike** isomorphic SSG/SSR rendering
- Styling with **@emotion/styled** and **styled-system** (token-driven design system)
- Server-state and data fetching with **TanStack Query**; forms with **TanStack Form**
- Schema-validated APIs with **zod**
- End-to-end testing via **Playwright**, unit/component testing with **Vitest**
- **Storybook** component catalogue (visual regression on **Chromatic**)
- Network mocking with **MSW** (dev, tests, and SSG prerender)
- Build-time `sitemap.xml` generation for SEO
- Continuous deployment to **GitHub Pages**

---

## 🚀 Running

From the repo root, top-level scripts proxy here (`pnpm dev`, `pnpm build`, …),
or run scripts directly inside `apps/web`:

```bash
pnpm install   # from the repo root
pnpm dev       # start the Vite dev server
```

`pnpm install` bootstraps `apps/web/.env.local` from [`default.env`](./default.env) (via the
root `postprepare` → `pnpm run setup`) so Vite has its `VITE_*` values — it never overwrites an
existing file. Edit `.env.local` for your local secrets, or re-run `pnpm run setup`.

---

## 📁 Structure

```
apps/web/
├── .storybook/                        # Storybook configuration.
├── @types/                            # Ambient TypeScript declarations.
├── public/                            # Static files served as-is (robots.txt, worker…).
├── scripts/                           # Codegen and coverage helpers.
├── src/
│   ├── App.tsx                        # Root application component.
│   ├── config.ts                      # App-wide configuration values.
│   ├── assets/                        # Images, icons, and fonts.
│   ├── common/                        # Reusable UI and app-shell components (Header, Footer, Layout…).
│   │   └── [Component]/               # index.ts · Component.tsx · *.test.tsx · *.stories.tsx · const.ts · utils.ts · README.md
│   ├── section/                       # Page-specific composed sections (Hero, Summary, ExperienceGraph…).
│   │   └── [Section]/                 # index.ts · Section.tsx · Section.data.ts · *.test.tsx · README.md
│   ├── pages/                         # Vike file-based routes (about, articles, contact, projects…).
│   │   └── [route]/                   # +Page.tsx · @id/ (+route.ts, +onBeforeRender.ts, +onBeforePrerenderStart.ts)
│   ├── theme/                         # Design system: styled primitives (View, Flex, Typography…).
│   ├── hooks/                         # Shared data-fetching hooks (useCustomQuery, useGists, useUser…).
│   ├── utils/                         # Framework-agnostic helpers (incl. api/ — client, query client, logger).
│   ├── renderer/                      # Vike SSR/CSR render hooks and app bootstrap.
│   ├── types/                         # Shared TypeScript types.
│   └── test/                          # Test infra — e2e/ (Playwright), mocks/ (MSW), utils/ (renderWithTheme…).
├── playwright.config.ts
├── vite.config.ts
└── package.json
```

---

## 📚 Layer docs

| Doc                                                                                        | Covers                                                                          |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| [`packages/design-system/design-system.md`](../../packages/design-system/design-system.md) | Styled primitives, tokens, and `system()`.                                      |
| [`src/common/common.md`](./src/common/common.md)                                           | Component folder structure and testing.                                         |
| [`src/section/section.md`](./src/section/section.md)                                       | Page-specific composed sections.                                                |
| [`src/pages/pages.md`](./src/pages/pages.md)                                               | Vike `+` files and SSR safety.                                                  |
| [`src/hooks/hooks.md`](./src/hooks/hooks.md)                                               | Data-fetching hook pattern.                                                     |
| Component demos                                                                            | [Storybook on Chromatic](https://main--6a17c33fc4e9466680e34e97.chromatic.com/) |

---

## 🛠️ Scripts

| Category            | Command                        | Description                                         |
| ------------------- | ------------------------------ | --------------------------------------------------- |
| **Develop**         | `pnpm dev`                     | Start the Vite dev server.                          |
| **Quality**         | `pnpm lint`                    | ESLint with `--max-warnings 0` (any warning fails). |
|                     | `pnpm format`                  | Format the codebase with Prettier.                  |
| **Test**            | `pnpm test`                    | Run Vitest in watch mode.                           |
|                     | `pnpm test:unit`               | Run only the unit project.                          |
|                     | `pnpm test:storybook`          | Run only the Storybook project.                     |
|                     | `pnpm test:ui`                 | Vitest interactive UI.                              |
| **Coverage**        | `pnpm test:coverage`           | Full coverage run.                                  |
|                     | `pnpm test:coverage:unit`      | Coverage for the unit project.                      |
|                     | `pnpm test:coverage:storybook` | Coverage for the Storybook project.                 |
|                     | `pnpm test:coverage:e2e`       | E2E coverage (Chromium, `E2E_COVERAGE=true`).       |
| **E2E**             | `pnpm test:e2e`                | Run Playwright end-to-end tests.                    |
|                     | `pnpm test:e2e:firefox`        | Run e2e in the Firefox project.                     |
|                     | `pnpm test:e2e:webkit`         | Run e2e in the WebKit project.                      |
|                     | `pnpm test:e2e:ui`             | Playwright interactive UI.                          |
| **Build & Preview** | `pnpm build`                   | Type-check then build for production.               |
|                     | `pnpm build:compress`          | Production build with gzip/brotli precompression.   |
|                     | `pnpm preview`                 | Preview the production build locally.               |
|                     | `pnpm preview:e2e`             | Serve `build/client` on port 3000 for e2e runs.     |
| **Storybook**       | `pnpm storybook`               | Run Storybook dev server on port 6006.              |
|                     | `pnpm build:storybook`         | Build static Storybook.                             |
| **Deploy**          | `pnpm deploy`                  | Publish `build/` to GitHub Pages (gh-pages).        |

---

## 🧪 Testing strategy

Tests run across **two nested matrices**, so a green build means "works
everywhere," not "works on my machine."

**OS matrix** — unit & component tests run on three runners in parallel:

| 🐧 Linux | 🪟 Windows | 🍎 macOS |
| :------: | :--------: | :------: |

Catches platform-specific bugs: path separators, case-sensitive imports,
line-ending / encoding, and locale & timezone differences.

**Browser matrix (Playwright)** — within each platform, end-to-end specs run
against all three major engines:

| Chromium | Firefox | WebKit |
| :------: | :-----: | :----: |

A feature can pass in Chromium and still break in WebKit (Safari) — engines
differ in CSS rendering, layout, and JS API support. Nesting the two means
every engine is exercised on every OS (3 × 3).

Touched files must reach **100%** coverage (`pnpm test:coverage`).
