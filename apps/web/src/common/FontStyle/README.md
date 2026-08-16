# FontStyle

A display card that showcases a single theme font family. Renders the variant token label, the parsed CSS font name, and a large `Aa` sample glyph set in that font.

```tsx
<FontStyle variant="mono" />
<FontStyle variant="sans" />
```

---

## Props

| Prop      | Type                   | Default | Description                      |
| --------- | ---------------------- | ------- | -------------------------------- |
| `variant` | `keyof Theme['fonts']` | -       | Font family token from the theme |

---

## Visual behaviour

- Root: `Paper` with `bg="primary"`, `borderRadius="md"`, column flex layout
- Top row: variant token label (uppercase, `mono` font) on the left; parsed font name at 50% opacity on the right
- Center: `Aa` glyph in the selected font at `5rem` / `font-weight: 300`

The `5rem` size and `weight: 300` are applied via a `styled(Typography)` override (`FontDisplay`) because neither value has a theme token equivalent.
