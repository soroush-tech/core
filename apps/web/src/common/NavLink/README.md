# NavLink

A navigation link that composes `Link` and automatically marks itself active when the current URL matches its `href`. Used in `Header` and `Footer` for site navigation.

```tsx
<NavLink href="/about" variant="button" letterSpacing="tight">
  About
</NavLink>
```

---

## Behaviour

| State    | Condition                                                  | `color`                              |
| -------- | ---------------------------------------------------------- | ------------------------------------ |
| Active   | `href="/"` and `urlPathname === "/"` (exact match)         | `primary`                            |
| Active   | `href !== "/"` and `urlPathname.startsWith(href)`          | `primary`                            |
| Inactive | No match                                                   | `secondary`                          |
| Hover    | Any - underline slides in via `Link`'s `underline="hover"` | `palette.primary.main` (from `Link`) |

`color` is always controlled by `NavLink` - passing a `color` prop via `{...rest}` will be overridden.

---

## Props

All [`LinkProps`](../../../theme/Link/README.md) are accepted and forwarded to `Link`. There are no additional props.

| Prop        | Type            | Default     | Description                                    |
| ----------- | --------------- | ----------- | ---------------------------------------------- |
| `href`      | `string`        | `undefined` | URL to link to; drives active detection        |
| `underline` | `LinkUnderline` | `'hover'`   | Overridden by NavLink default                  |
| `color`     | -               | auto        | Set by active state; cannot be overridden      |
| ...         | `LinkProps`     | -           | All other Link / Typography props pass through |

---

## Notes

- Active detection uses `usePageContext` from Vike - works correctly under SSR.
- `underline="hover"` is locked; the slide-in underline comes from `Link`'s `::after` pseudo-element.
- `color` is intentionally last in the prop spread so it always wins over any caller-supplied value.
