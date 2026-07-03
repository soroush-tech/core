# Flicker

A `Flex` wrapper that continuously flickers its opacity — used to frame unstable or
warning glyphs (e.g. the alert icon on the error page).

```tsx
<Flicker alignItems="center">
  <Icon name="warning" color="error" size="3.75rem" />
</Flicker>
```

---

## Props

Extends [`FlexProps`](../../theme/Flex/README.md) — every `Flex` prop (`flexDirection`,
`alignItems`, `gap`, spacing, layout…) is accepted and forwarded. `Flicker` adds no props
of its own.

---

## Behaviour

- Runs an infinite opacity keyframe (`2s`): a short blink burst (`0.7 ⇄ 1`) in the first ~20%
  of each cycle, then holds at `0.7` — the steady hold acts as a per-cycle delay between bursts.

---

## Notes

- Custom CSS (`styled` template) is intentional: a keyframe animation has no
  styled-system prop equivalent.
