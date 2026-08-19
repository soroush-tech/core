# IconCard

A card with an icon, an uppercase heading, and body copy - the shared card used across the about-page sections (Core Values, Delivery Domains, Current Focus, Architectural Decisions & AI Integration). Built on `Card` with the `interactive` variant.

---

## Props

### `icon`

`IconName` - Icon shown at the top of the card (`primary`, `2.25rem`).

### `title`

`string` - Rendered as an uppercase level-3 heading (`h4` variant, `as="h3"`).

### `body`

`string` - Body copy rendered under the title (`body2`, `secondary`).

### `children`

`ReactNode` - Optional extra content rendered after the body, e.g. a tag or a meta line.

```tsx
<IconCard icon="stacks" title="Next-Gen Full-Stack" body="...">
  <Typography variant="caption" color="secondary" textTransform="uppercase" m={0}>
    Stack: React, NestJS, WASM
  </Typography>
</IconCard>
```

---

## Styling

Fixed look, no style props: `interactive` `Card`, `bg="paper"`, light thin solid border, `p={4}`, `gap={3}`, a `2.25rem` primary icon, an `h4`-as-`h3` uppercase title, and `body2` secondary body copy.
