# Avatar

Displays a user image, initials, or icon in a consistently sized container. Supports three shapes, four preset sizes, an optional ring outline, and automatic image-error fallback. All styles derive from theme tokens.

---

## Image source priority

`src` and `srcSet` are the primary source (`srcSet` serves as responsive variants alongside `src`, not a separate fallback step). When the primary source fails, the component advances to `fallback`, then to `children`.

```
src (+ srcSet) → fallback → children
```

When only `srcSet` is provided (no `src`), it becomes the primary source.

---

## Avatar-specific props

### `src`

Primary image URL.

```tsx
<Avatar src="https://example.com/photo.jpg" alt="Jane Doe" />
```

---

### `srcSet`

Forwarded to the inner `<img>` element's `srcset` attribute. Also used as the primary image source when `src` is absent.

---

### `alt`

Alt text for the image. Required for accessibility when an image is rendered.

---

### `fallback`

Secondary image URL shown when `src` (and `srcSet`) are absent or fail to load. `children` are shown only when both the primary source and `fallback` have failed.

```tsx
<Avatar src={userPhoto} fallback="/default-avatar.svg" alt="Jane">
  JD
</Avatar>
```

---

### `children`

Rendered when no image source is available or all sources have errored — typically initials or an icon.

```tsx
<Avatar bg="secondary">JD</Avatar>
```

---

### `variant`

Controls the shape of the avatar container via `border-radius`.

| Value        | border-radius          |
| ------------ | ---------------------- |
| `"circular"` | `50%`                  |
| `"rounded"`  | `theme.radii.md` (8px) |
| `"square"`   | `0`                    |

Default: `"circular"`.

---

### `size`

Preset size — resolves against `theme.avatar`.

| Value  | width / height |
| ------ | -------------- |
| `"sm"` | 32px           |
| `"md"` | 40px           |
| `"lg"` | 48px           |
| `"xl"` | 56px           |

Default: `"md"`.

---

### `ring`

`boolean` — adds a CSS outline around the avatar.

Default: `1px solid theme.border.primary` with `outline-offset: 2px`.

---

### `ringColor`

Overrides the ring color — resolves against `theme.border`.

| Token       | Description            |
| ----------- | ---------------------- |
| `"light"`   | Subtle border          |
| `"primary"` | Accent color (default) |
| `"dark"`    | High-contrast border   |

---

### `ringWidth`

Overrides the ring width — resolves against `theme.borderWidths`.

| Token     | Value         |
| --------- | ------------- |
| `"none"`  | 0             |
| `"thin"`  | 1px (default) |
| `"base"`  | 2px           |
| `"thick"` | 4px           |

---

## Styled-system props

Avatar extends `Flex` minus all padding props. Outer spacing (`m`, `mt`, `mr`, `mb`, `ml`, `mx`, `my`) adjusts margin via `theme.space`. Padding is intentionally excluded — the image fills the container with `object-fit: cover` and padding would break the fill.

---

## Examples

```tsx
// Primary image
<Avatar src="/photo.jpg" alt="Jane Doe" />

// Primary + fallback image + initials last resort
<Avatar src={userPhoto} fallback="/default.svg" alt="Jane">
  JD
</Avatar>

// Initials fallback
<Avatar bg="secondary">JD</Avatar>

// Icon fallback
<Avatar bg="secondary" size="lg">
  <Icon name="user" />
</Avatar>

// Shape variants
<Avatar variant="circular" />
<Avatar variant="rounded" />
<Avatar variant="square" />

// Sizes
<Avatar size="sm" />
<Avatar size="md" />
<Avatar size="lg" />
<Avatar size="xl" />

// Ring outline
<Avatar ring src="/photo.jpg" alt="Jane" />

// Custom ring color and width
<Avatar ring ringColor="dark" ringWidth="base" src="/photo.jpg" alt="Jane" />
```
