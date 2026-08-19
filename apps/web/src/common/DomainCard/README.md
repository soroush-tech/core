# DomainCard

A bento-grid card representing a technical domain. Built on `Card`'s `bracketBox` variant with hover effects - bracket corners reveal on hover, images transition from grayscale to full colour, and the background lifts to `background.paper`.

```tsx
<DomainCard
  index={1}
  title="01. REAL-TIME SYSTEMS & HIGH-CONCURRENCY"
  description="Focus on live systems requiring extreme synchronization."
  tags={['WEBSOCKETS', 'RUST_ACTORS', 'EVENT_LOOPS']}
  image="/domains/realtime.png"
  imageAlt="Signal Whisperer Commander"
/>
```

---

## Props

| Prop          | Type            | Default | Description                                        |
| ------------- | --------------- | ------- | -------------------------------------------------- |
| `index`       | `number`        | -       | Card number (1-n). Renders as `#01` badge.         |
| `title`       | `string`        | -       | Domain title (shown as heading).                   |
| `description` | `string`        | -       | Short domain description.                          |
| `tags`        | `string[]`      | -       | Technology/keyword chips below the description.    |
| `image`       | `string`        | -       | Image URL. Omit to render card without image.      |
| `imageAlt`    | `string`        | `''`    | Alt text for the image.                            |
| `featured`    | `boolean`       | `false` | Horizontal layout - fixed 480px image beside text. |
| `style`       | `CSSProperties` | -       | Forwarded to the root element (e.g. `gridColumn`). |
| `className`   | `string`        | -       | Forwarded to the root element.                     |

---

## Visual behaviour

- Root: `Card` with `variant="bracketBox"`, `elevation={0}`, `bg="primary"`, `borderRadius="sq"`, `borderWidth="thin"`, `borderStyle="solid"`, `borderColor="light"`, `p={4}`
- Module badge: `caption` variant, `color="primary"`, `opacity=0.3`, absolutely positioned top-right
- Card title: `fontSize={3}` + `fontWeight="bold"` (20 px), `color="primary"`
- Featured title: `fontSize={4}` + `fontWeight="black"` (24 px), `color="primary"`
- Tags: `caption` variant, `background.paper` chip background

## Hover effects (custom CSS)

The following can't be expressed as theme primitive props:

| Effect                     | CSS                                                       |
| -------------------------- | --------------------------------------------------------- |
| Background lift            | `&:hover { background-color: theme.background.paper }`    |
| Bracket corners visibility | `&::before, &::after { opacity: 0.2 }` → `1` on hover     |
| Image colour reveal        | `img { filter: opacity(80%) }` → `opacity(100%)` on hover |
