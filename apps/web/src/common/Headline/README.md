# Headline

A section heading with a full-width decorative divider line. Used at the top of named content sections on a page.

```tsx
<Headline title="01 . Core Layout" />
```

---

## Props

| Prop    | Type     | Default | Description          |
| ------- | -------- | ------- | -------------------- |
| `title` | `string` | -       | Section heading text |

---

## Visual behaviour

- `title` renders as a `Typography variant="h3"` with `letterSpacing="tighter"` and `color="initial"`
- A horizontal `Divider` line fills the remaining width via `flex: 1`
- The divider colour is `theme.border.primary` at `4D` opacity (≈ 30%)
