# SystemArchitectures

System-architectures bento grid ("System Architectures / 02"). An eyebrow heading
above an asymmetric four-tile grid: a tall image tile (Global Data Mesh), a wide
Event-Driven Core tile, a Cloud Native list, and a Zero Trust tile.

## Props

None. The section renders static content.

## Layout

Desktop is a 4-column × 2-row grid (`800px` tall); below desktop the tiles stack to
one column. Spans are set with the `Grid` component's `gridColumn` / `gridRow` props:

| Tile              | Desktop placement             |
| ----------------- | ----------------------------- |
| Global Data Mesh  | `span 2` cols × `span 2` rows |
| Event-Driven Core | `span 2` cols                 |
| Cloud Native      | 1 cell                        |
| Zero Trust        | 1 cell                        |

## Composition

| Region           | Built from                                                             |
| ---------------- | ---------------------------------------------------------------------- |
| Section root     | `View as="section" bg="primary"`                                       |
| Eyebrow          | `Typography variant="overline" as="h2"`                                |
| Grid             | `Grid` (container) + `Grid` tiles for span support                     |
| Image tile       | `Image objectFit="cover"` + `bg="backdrop"` overlay + content          |
| Enterprise badge | `styled(Typography)` → `palette.primary.main` / `contrastText`         |
| Tile titles      | `Typography` (`h3` / `h5`) all rendered `as="h3"`                      |
| List bullets     | `View` `0.375rem` squares, `bg="primary"`                              |
| Decoration       | `architecture` / `security` icons in `opacity` wrappers, `aria-hidden` |

## Assets

- `src/assets/datacenter-server-room.png` - image-tile background.
- `src/assets/icons/`: `hub`, `architecture` (existing), `security` - Material
  Symbols (filled, `#9cff93`). Decorative icons are `alt=""` + `aria-hidden`.

## Notes

- Per the **No-Line rule**, the source's `border-b-4` / `border-l` accents are dropped;
  tiles are separated by the grid gap revealing the section background, and by their
  own `surface-container` tiers. The neon accent is carried by icons, the green badge,
  and the list bullets.
- The image is dimmed with the `background.backdrop` token instead of a CSS `filter`.
- All four tile titles render `as="h3"` to keep heading order under the section `h2`.

## Usage

```tsx
import { SystemArchitectures } from 'src/section/SystemArchitectures'
;<SystemArchitectures />
```
