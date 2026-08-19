# Articles

Renders the article index - the list of published gists as links to each article. Fetches the gist
list via `useGists` and renders one `NavLink` per gist to `/article/:id`.

```tsx
import { Articles } from 'src/section/Articles'
;<Articles />
```

Rendered at `/articles` by `src/pages/articles/+Page.tsx`. Stateless - accepts no props.

---

## Structure

| Region  | Element                   | Notes                                 |
| ------- | ------------------------- | ------------------------------------- |
| Root    | `Flex as="main"`          | Centred, `minHeight="100vh"`          |
| Heading | `Typography variant="h1"` | "Articles"                            |
| List    | `View as="section"`       | One `NavLink` per gist, keyed by `id` |

## Data

- `useGists()` - suspense query; the page wraps `Articles` in `<Suspense>`.
- Each link targets `/article/${gist.id}` and shows the gist `description`.
