# Article

Renders a single article body from a GitHub gist. Receives an already-fetched `Gist` and renders the
`en.md` body through the `Preview` component, which maps every markdown element to a design-system
primitive.

```tsx
import { Article } from 'src/section/Article'
;<Article data={gist} />
```

Rendered at `/article/:id` by `src/pages/article/@id/+Page.tsx`. The page fetches the gist via
`useGistById`, renders the heading through `PageHeader`, and passes the data down to `Article`.

---

## Props

| Prop   | Type   | Default | Description                                      |
| ------ | ------ | ------- | ------------------------------------------------ |
| `data` | `Gist` | —       | The fetched gist whose `en.md` file is rendered. |

---

## Structure

| Region  | Element              | Notes                                        |
| ------- | -------------------- | -------------------------------------------- |
| Body    | `Paper as="section"` | `bg="paper"`, `maxWidth="1280px"`, centered  |
| Body MD | `Preview`            | Markdown elements mapped to theme primitives |

## Data

- Fetching is owned by the page (`useGistById` — a suspense query); the heading is rendered by
  `PageHeader` and the body data is passed to `Article` as a prop.
- Markdown rendering lives in the [`Preview`](../../theme/Markdown/Preview) component
  (`@soroush.tech/design-system/Markdown`).
