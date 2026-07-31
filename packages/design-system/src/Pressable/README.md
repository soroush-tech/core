# Pressable

An unstyled clickable surface: button semantics — keyboard activation, focus ring, disabled
state — with none of a button's looks. It carries no padding, margin, border, background, or
font of its own, so it can wrap arbitrary content without shifting a single pixel of it.

Reach for this instead of putting `onClick` on a `div` or a styled `Flex`. Those are invisible
to keyboard and screen-reader users; this is not. Reach for [`Button`](../Button/README.md)
instead when you want something that _looks_ like a button.

`feedback` picks what happens while the surface is held — nothing (the default), the content
dims, or the surface tints. Feedback is press-only, so hover styling stays entirely yours.

## What it renders

A **`div`** by default. That is deliberate: a `<button>` may only contain phrasing content, so
it cannot legally wrap a link, another button, or block-level markup — exactly the things a
clickable card or row is made of. The div is given `role="button"`, a tab stop, `Enter`/`Space`
activation, and `aria-disabled`, so it is announced and operated as a button regardless.

| `as`              | Element  | Semantics                                      |
| ----------------- | -------- | ---------------------------------------------- |
| _(default)_       | `div`    | Shimmed — `role`, `tabIndex`, Enter/Space.     |
| `"button"`        | `button` | Native. Use when the content is phrasing-only. |
| _(any other tag)_ | that tag | Shimmed, same as the div.                      |
| _(`href` set)_    | `a`      | Native link. No shim; `Enter` activates.       |

`as="button"` is worth reaching for when the content is phrasing-only and you want the browser
rather than a shim to do the work.

Whichever element it renders, its text is not selectable: dragging across it or double-clicking
it presses rather than highlighting, matching a native button. Override with `userSelect` through
`theme.components.Pressable.styleOverrides` or a `styled()` wrapper if you are deliberately
wrapping selectable copy.

## Usage

```tsx
// A clickable row that lays out exactly as it would unwrapped.
<Pressable onClick={() => select(id)}>
  <Flex flexDirection="row" alignItems="center" gap={2}>
    <Icon name="folder" size="1.25rem" color="inherit" />
    <span>Documents</span>
  </Flex>
</Pressable>

// Dim the content while held.
<Pressable feedback="opacity" activeOpacity={0.4} onClick={onPress}>
  <Avatar src={user.avatar} alt={user.name} />
</Pressable>

// Tint the surface while held — padding and radius are opt-in.
<Pressable feedback="highlight" color="secondary" p={2} borderRadius="md" onClick={onPress}>
  <Typography as="span">Settings</Typography>
</Pressable>

// A native button — the content here is phrasing-only, so it is legal.
<Pressable as="button" onClick={onPress}>
  <Typography as="span">Save</Typography>
</Pressable>

// Renders an anchor.
<Pressable href="/docs">Read the docs</Pressable>
```

## Props

Also accepts every `space`, `layout`, `border`, and `typography` styled-system prop, plus the
usual HTML attributes (`onClick`, `aria-*`, `data-*`, …).

| Prop            | Type                                 | Default     | Description                                                                                                                           |
| --------------- | ------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `as`            | `ElementType`                        | `'div'`     | Element to render. `'button'` for native semantics; anything else is shimmed.                                                         |
| `feedback`      | `'none' \| 'opacity' \| 'highlight'` | `'none'`    | What happens while the surface is held. See the table below.                                                                          |
| `color`         | `PaletteColor`                       | `'primary'` | Palette the `highlight` tint derives from — resolves against `theme.palette`.                                                         |
| `activeOpacity` | `number`                             | `0.7`       | Opacity held content fades to under `feedback="opacity"`.                                                                             |
| `href`          | `string`                             | —           | Renders an `a` element when `as` is unset.                                                                                            |
| `target`        | `string`                             | —           | Anchor `target` — only meaningful with `href`.                                                                                        |
| `rel`           | `string`                             | —           | Anchor `rel` — only meaningful with `href`.                                                                                           |
| `type`          | `'button' \| 'submit' \| 'reset'`    | `'button'`  | Emitted only for `as="button"`, so a surface in a form never submits by accident.                                                     |
| `disabled`      | `boolean`                            | `false`     | Blocks activation, suppresses press feedback, and swaps the cursor. Uses the native attribute on a button, `aria-disabled` elsewhere. |

### Feedback modes

| Mode        | While held                                                          |
| ----------- | ------------------------------------------------------------------- |
| `none`      | Nothing — the wrapped content is left completely alone.             |
| `opacity`   | The whole surface fades to `activeOpacity`.                         |
| `highlight` | The surface fills with `color` at 12.5% opacity behind the content. |

Padding and a `borderRadius` are worth setting alongside `highlight` — the tint is drawn on the
element's own box, so without them it hugs the content and squares off at the corners.

## Accessibility

- Enter and Space activate it and it lands in the tab order, whether it renders a native button
  or a shimmed element — you never write `role`, `tabIndex`, or `onKeyDown` yourself. Space is
  suppressed on keydown (so the page does not scroll) and fires on keyup, as a real button does.
- Give it an accessible name: readable text among its children, or an `aria-label` when the
  content is icon-only.
- The `:focus-visible` ring is keyboard-only. `outline: none` is the resting state, so pointer
  clicks show no ring.
- Press feedback is decorative. Anything a sighted user learns from the press state must also be
  conveyed semantically — `aria-pressed` for a toggle, `aria-expanded` for a disclosure.

## Theming

| Slot   | Element               |
| ------ | --------------------- |
| `root` | The rendered element. |

Customize via `theme.components.Pressable.styleOverrides`, and set app-wide defaults for
`feedback`, `color`, and `activeOpacity` via `theme.components.Pressable.defaultProps`.
