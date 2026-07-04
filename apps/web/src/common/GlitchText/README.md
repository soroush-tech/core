# GlitchText

`Typography` with a looping RGB-split glitch animation — an oversized, corrupted-signal
heading (used for the `404` glyph on the error page).

```tsx
<GlitchText as="h1" variant="inherit" color="primary" secondaryColor="error">
  404
</GlitchText>

// Second, quieter instance — inverted keyframes so it doesn't jitter in lock-step
<GlitchText inverted color="secondary" secondaryColor="primary">
  SYSTEM FAILURE
</GlitchText>
```

---

## Props

Extends [`TypographyProps`](../../theme/Typography/README.md) — every `Typography` prop
(`variant`, `color`, `fontSize`, `fontWeight`, `as`, spacing, layout…) is accepted and
forwarded. Adds three of its own:

| Prop             | Type             | Default     | Description                                                 |
| ---------------- | ---------------- | ----------- | ----------------------------------------------------------- |
| `color`          | `TextColorToken` | `'primary'` | `theme.text` token for the glyph fill and first split layer |
| `secondaryColor` | `TextColorToken` | `'error'`   | `theme.text` token for the second split layer               |
| `inverted`       | `boolean`        | `false`     | Play the opposite glitch keyframes (mirror timing/offsets)  |

---

## Behaviour

- Runs an infinite `text-shadow` glitch keyframe (`2s`): a short RGB-split burst in the first
  few percent of each cycle, then holds steady — same period as `Flicker` so they pulse in sync.
  `inverted` swaps in the mirrored keyframes so stacked instances don't jitter in lock-step.
- The two RGB-split colours are token-driven, injected as CSS custom properties from the
  `color` / `secondaryColor` props: `--glitch-a` = `theme.text[color]`,
  `--glitch-b` = `theme.text[secondaryColor]`.

---

## Notes

- Custom CSS (`styled` template) is intentional: an animated `text-shadow` has no
  styled-system prop equivalent.
- Sizing is left to the caller via the `fontSize` prop (responsive arrays supported) so
  the component stays layout-agnostic.
