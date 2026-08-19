# CookieNotice

Sticky, dismissible bar that explains the site is cookie-free. Rendered site-wide by `Layout` as the last element of the page. It pins to the bottom of the viewport while scrolling and docks into place at the end of the page via `position: sticky; bottom: 0` - no JS. Clicking the X removes it from view; there is **no persistence** - it re-shows on the next page load.

## Props

| Prop      | Type     | Default                        | Description                                |
| --------- | -------- | ------------------------------ | ------------------------------------------ |
| `message` | `string` | `"Cookie-Free by Design. ..."` | Body copy explaining the cookie situation. |

## Composition

- **Root** - `styled(View)` with `position: sticky; bottom: 0` and a single-side top border in `border.primary` at reduced opacity (matching the Header). Frosted-glass surface matching `AppBar`: `background.appBar` (semi-transparent) + `backdrop-filter: blur(theme.blur)`.
- **Layout** - `Flex` row with the message left and the dismiss control right.
- **Icon** - `Icon name="cookie"` in `text.primary`.
- **Message** - `Typography` body2 in `text.secondary`.
- **Dismiss** - text `Button` (`size="sm"`) holding an `Icon name="close"`, labelled `Dismiss cookie notice`.

## Motion

Slides up from below the viewport on mount (`0.5s ease-out`). Suppressed under `prefers-reduced-motion: reduce`.

## Accessibility

Exposed as `role="region"` with `aria-label="Cookie notice"`. The icon-only dismiss button carries an `aria-label` so it has an accessible name.
