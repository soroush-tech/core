# Hooks

Conventions for hooks in `src/hooks/` and co-located component hooks.

---

## Where hooks live

| Hook type                                                         | Location                                                     |
| ----------------------------------------------------------------- | ------------------------------------------------------------ |
| API / data-fetching hooks                                         | `src/hooks/useHookName.ts` - always here, always shared      |
| Domain-logic hooks (UI state, derived state, component behaviour) | `src/common/ComponentName/hooks/useHookName.ts` - co-located |

**API hooks are always generic** - any hook that makes an HTTP call belongs in `src/hooks/` regardless of which component uses it.

**Domain-logic hooks are co-located** - a hook that encapsulates behaviour specific to one component (filtering, toggling, derived state) lives next to that component. It is only promoted to `src/hooks/` if a second component needs it.

---

## File structure

Each hook is a **flat file with a co-located test** - no per-hook folder, no `index.ts`:

```
src/hooks/
  useGists.ts
  useGists.test.ts
  useGistById.ts
  useGistById.test.ts
```

Import each hook directly by file path:

```ts
import { useGists } from 'src/hooks/useGists'
```

Co-located domain hooks follow the same flat shape inside the component's `hooks/` folder:

```
src/common/
  DomainCard/
    hooks/
      useDomainSort.ts
      useDomainSort.test.ts
    DomainCard.tsx
    DomainCard.test.tsx
    index.ts
    README.md
```

---

## Data-fetching hook pattern

Every data-fetching hook is built around a private query factory and exports up to three functions:

```ts
// 1. Private query factory - single source of truth for queryKey + config
const getGistsQuery = () => ({
  queryKey: ['gists'],
  config: { url: `/users/soroushm/gists`, method: 'get' },
})

// 2. Client hook - used in React components (requires Suspense boundary)
export function useGists() {
  return useCustomQuery<Gists>(getGistsQuery())
}

// 3. SSR prefetch - called in +onBeforeRender.ts to warm the cache before render
export const prefetchGists = () => prefetchQuery(getGistsQuery())

// 4. Raw fetch - called in +onBeforePrerenderStart.ts to enumerate static paths
export function getGists() {
  return client.call<Gists>(getGistsQuery().config)
}
```

Export `prefetchHookName` and `getHookName` only when the data is needed during SSR or static prerender. Client-only hooks export `useHookName` alone.

### `useCustomQuery` - always use this, never `useQuery` directly

`useCustomQuery` wraps `useSuspenseQuery` and wires the correct Axios client. `prefetchQuery` wires the server client for SSR:

```ts
import { useCustomQuery, prefetchQuery } from 'src/hooks/useCustomQuery'
```

Do not call `useSuspenseQuery`, `useQuery`, or `queryClient.prefetchQuery` directly - always go through these wrappers.

### Query keys

Stable, serialisable arrays. String literals for resource names; dynamic segments as additional items:

```ts
queryKey: ['gists'] // collection
queryKey: ['gist', id] // single item
```

---

## Testing - integration tests with MSW

Hook tests are **integration tests**: the real hook runs against a real query client; MSW intercepts the HTTP request. Do not mock `useCustomQuery` or `client` in hook tests.

### Setup (already global)

`src/setupTests.ts` starts the MSW node server before all tests and resets handlers after each - no per-file setup needed.

### Wrapper

Use `queryWrapperWithSuspense` from `src/test/utils/wrapper` - provides `Suspense` + `QueryClientProvider` + `ThemeProvider`:

```ts
import { queryWrapperWithSuspense as wrapper } from 'src/test/utils/wrapper'
```

### Adding MSW handlers

Shared handlers go in `src/test/mocks/handlers.ts`. For test-specific responses use `server.use()` inline - it is reset automatically after each test:

```ts
import { server } from 'src/test/mocks/server'
import { http, HttpResponse } from 'msw'

server.use(
  http.get('*/users/soroushm/gists', () =>
    HttpResponse.json([{ id: 'abc', description: 'test gist' }])
  )
)
```

### Example

```ts
import { renderHook, waitFor } from '@testing-library/react'
import { queryWrapperWithSuspense as wrapper } from 'src/test/utils/wrapper'
import { server } from 'src/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { useGists } from './useGists'

describe('useGists', () => {
  it('returns gist data from the API', async () => {
    server.use(
      http.get('*/users/soroushm/gists', () =>
        HttpResponse.json([{ id: 'abc', description: 'test gist' }])
      )
    )

    const { result } = renderHook(() => useGists(), { wrapper })

    await waitFor(() => expect(result.current.isFetched).toBe(true))
    expect(result.current.data).toEqual([{ id: 'abc', description: 'test gist' }])
  })

  it('returns an empty array when the API returns none', async () => {
    server.use(http.get('*/users/soroushm/gists', () => HttpResponse.json([])))

    const { result } = renderHook(() => useGists(), { wrapper })

    await waitFor(() => expect(result.current.isFetched).toBe(true))
    expect(result.current.data).toEqual([])
  })
})
```

### Minimum coverage per data-fetching hook

| Test                        | What to assert                                      |
| --------------------------- | --------------------------------------------------- |
| Happy path                  | Hook returns the expected data shape from the API   |
| Empty response              | Hook handles an empty array / null without crashing |
| `prefetchHookName`          | Resolves without throwing                           |
| `getHookName` (if exported) | Returns the raw API data                            |

---

## Rules

- **No JSX, no UI** - hooks return data and state only; never JSX or styled components
- **No side effects at module level** - all API calls happen inside the hook or exported async functions, never at import time
- **TypeScript generics** - always pass the response type: `useCustomQuery<T>`, `client.call<T>`
- **`use` prefix** - hook functions are named `useHookName`; non-hook exports (`prefetchGists`, `getGists`) use plain camelCase
