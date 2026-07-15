# Pages

Conventions for everything in `src/pages/`. Pages are Vike file-based routes — each subfolder maps directly to a URL segment.

---

## What belongs here

`src/pages/` contains **route-level components and their Vike hook files**. Nothing else.

| Belongs in `src/pages/`                                | Belongs elsewhere                                  |
| ------------------------------------------------------ | -------------------------------------------------- |
| `+Page.tsx` — the rendered page component              | Reusable UI → `src/common/`                        |
| `+route.ts` — custom route matching logic              | Design primitives → `@soroush.tech/design-system/` |
| `+onBeforeRender.ts` — SSR data prefetch               | Shared data / helpers → `src/utils/`               |
| `+onBeforePrerenderStart.ts` — static path enumeration | Shared hooks → `src/hooks/`                        |

---

## Vike file reference

| File                         | Exports                                             | Purpose                                                        |
| ---------------------------- | --------------------------------------------------- | -------------------------------------------------------------- |
| `+Page.tsx`                  | `export default function PageName()`                | The React component Vike renders for the route                 |
| `+route.ts`                  | `export function route(pageContext)`                | Custom route matching when the folder name is not enough       |
| `+onBeforeRender.ts`         | `export async function onBeforeRender(pageContext)` | Prefetch data into the query cache before SSR render           |
| `+onBeforePrerenderStart.ts` | `export async function onBeforePrerenderStart()`    | Return the list of URLs to statically pre-render at build time |

Only create a `+` file when its behaviour is actually needed. A route with no dynamic data needs only `+Page.tsx`.

---

## Page component shape

```tsx
// src/pages/articles/+Page.tsx
import { Suspense } from 'react'
import { Layout } from 'src/common/Layout'
import { Articles } from 'src/section/Articles'

export default function ArticlesPage() {
  return (
    <Layout>
      <Suspense fallback={<div>Loading…</div>}>
        <Articles />
      </Suspense>
    </Layout>
  )
}
```

Rules:

- **Always `export default`** — Vike requires a default export; no named exports alongside it
- **Always wrap in `<Layout>`** — never render page content outside `Layout`
- **Function name matches the route** — `ArticlesPage`, `DomainPage`, `AboutPage`; not `Page`, `App`, or anonymous
- **Compose, don't build** — assemble from `src/section/`, `src/common/`, and `@soroush.tech/design-system/` components; keep `+Page.tsx` thin. Page-specific regions belong in `src/section/`, not inline in `+Page.tsx`

---

## Page-local styled components

One-off styled components that are specific to a single page live inline in `+Page.tsx`. They are not extracted to `src/common/` unless reused by a second page.

Rules:

- Label every `styled()` call with `{ label: 'ComponentName' }` for readable Emotion class names
- Include a comment explaining why custom CSS is required
- All colours reference theme tokens — no hardcoded hex values
- Opacity uses the hex-suffix pattern: `${({ theme }) => theme.text.primary}80`

---

## Data files

Static data used by only one page lives co-located with that page:

```
src/pages/domain/
  +Page.tsx
  domain.data.ts    ← owned by this page only
```

If data is fetched at runtime, use a hook from `src/hooks/`. If static data is shared across multiple pages, move it to `src/utils/`.

---

## SSR safety

Vike renders pages on the server. Never access browser-only APIs at module top level:

```tsx
// ❌ — crashes during SSR
const width = window.innerWidth

// ✅ — safe in an effect
useEffect(() => {
  const width = window.innerWidth
}, [])

// ✅ — safe guard
if (typeof window !== 'undefined') { ... }
```

---

## Testing

Pages are **not unit tested**. Their correctness is validated by Playwright e2e specs co-located next to the page as `*.e2e.ts`.

- Unit test the components pages compose (`src/common/`, `src/hooks/`) — not the page itself
- Write one e2e spec per route covering the happy path and critical user interactions
- E2e specs live next to their page as `*.e2e.ts` (e.g. `src/pages/domain/domain.e2e.ts`) and run against the full dev server via `pnpm test:e2e`. Shared infra (`fixtures.ts`, coverage hooks) stays in `src/test/e2e/`

Because pages have no unit tests, `src/pages/` is excluded from the unit coverage target in `vitest.config.ts`.

---

## Routing

Vike routes are derived from the folder path under `src/pages/`:

| Folder                     | URL                      |
| -------------------------- | ------------------------ |
| `src/pages/index/`         | `/`                      |
| `src/pages/about/`         | `/about`                 |
| `src/pages/articles/`      | `/articles`              |
| `src/pages/article/@id/`   | `/article/:id` (dynamic) |
| `src/pages/domain/`        | `/domain`                |
| `src/pages/design/system/` | `/design/system`         |

Use `+route.ts` only when the folder-based convention cannot express the matching logic needed.
