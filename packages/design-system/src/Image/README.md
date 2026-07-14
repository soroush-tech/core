# Image

A styled-system `<img>` primitive. Accepts all layout, space, background, and position props from the theme, plus `objectFit` / `objectPosition` for common image sizing patterns and `borderRadius` for rounded corners.

Built-in source priority and error recovery: when a source fails to load the component advances to the next URL automatically. `onError` fires only when **all** sources are exhausted.

---

## Source priority

**Initial render** — props map to `<img>` attributes as follows:

- `src` → `src` attribute.
- `srcSet` → `srcset` attribute (used alongside `src`, or as the primary source when `src` is absent).
- `fallback` → `src` attribute when both `src` and `srcSet` are absent.

**Error recovery** — when the browser fails to load, the component advances through phases:

```
src + srcSet  →  src (srcSet dropped)  →  fallback  →  onError
src only      →  fallback              →  onError
srcSet only   →  fallback              →  onError
```

`onError` fires only after all sources are exhausted.

---

## Image-specific props

### `src`

Primary image URL passed to the underlying `<img>` element.

---

### `srcSet`

Forwarded to `<img srcset>` when `src` is present. Also used as the primary source when `src` is absent.

---

### `alt`

Alt text — required for accessibility when any image source is provided.

---

### `fallback`

Secondary image URL. Used as `fallback` immediately when both `src` and `srcSet` are absent. When a primary source is present, tried automatically after it fails. `onError` is called once all sources are exhausted.

---

### `onError`

Called once when **all** sources have failed. Use this to swap in a non-image fallback at the parent level.

---

### `objectFit`

CSS `object-fit`. Common values: `cover` · `contain` · `fill` · `none` · `scale-down`.

---

### `objectPosition`

CSS `object-position`. Accepts any valid CSS value, e.g. `center`, `top left`, `50% 25%`.

---

### `borderRadius`

Corner radius — resolves against `theme.radii`.

| Token  | Value |
| ------ | ----- |
| `"sq"` | 0     |
| `"sm"` | 4px   |
| `"md"` | 8px   |
| `"lg"` | 16px  |

---

## Styled-system props

### Layout

`width` · `height` · `minWidth` · `minHeight` · `maxWidth` · `maxHeight` · `display` · `overflow`

---

### Background

`backgroundImage` · `backgroundSize` · `backgroundPosition` · `backgroundRepeat` · `backgroundAttachment`

---

### Space — `theme.space`

| Prop                              | Shorthand for   |
| --------------------------------- | --------------- |
| `m` `mt` `mr` `mb` `ml` `mx` `my` | margin + sides  |
| `p` `pt` `pr` `pb` `pl` `px` `py` | padding + sides |

---

### Position

`position` · `zIndex` · `top` · `right` · `bottom` · `left`

---

## Examples

```tsx
// Basic
<Image src="/photo.jpg" alt="Profile" width="200px" height="200px" objectFit="cover" />

// With fallback
<Image src={userPhoto} fallback="/default-avatar.svg" alt="User" />

// Full error chain with onError
<Image
  src={broken}
  fallback="/default.svg"
  alt="User"
  onError={() => setShowInitials(true)}
/>

// CSS background image
<Image
  backgroundImage="url('/hero.jpg')"
  backgroundSize="cover"
  backgroundPosition="center"
  width="100%"
  height="400px"
/>

// Responsive srcSet
<Image
  src="/photo.jpg"
  srcSet="/photo@2x.jpg 2x, /photo@3x.jpg 3x"
  alt="Photo"
  width="300px"
  height="300px"
  objectFit="contain"
/>
```
