# LayoutFrame

The page frame from `theme.layout` - the side margins and max width of the layout grid - around content that isn't laid out in columns (a text block, a markdown article, a form card). It renders a `Grid` with the `layout` prop and one slot that spans every column, so the frame follows the theme instead of a hand-written `maxWidth` and padding.

Content that _is_ in columns uses `<Grid layout>` directly and places its children with `span`.

## Usage

```tsx
import { LayoutFrame } from 'src/common/LayoutFrame'
;<LayoutFrame as="section" py={6}>
  <Typography variant="body1">Framed content</Typography>
</LayoutFrame>

// A frame of its own - here 1280px including the margins
<LayoutFrame layout={{ maxWidth: '1280px' }}>...</LayoutFrame>
```

## Props

All `GridProps` are accepted and forwarded to the outer layout grid (`as`, spacing, position, text alignment - which the content inherits).

| Prop       | Type                  | Default | Description                                                                                                                                                                        |
| ---------- | --------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `children` | `ReactNode`           | -       | Content of the full-width slot                                                                                                                                                     |
| `layout`   | `GridProps['layout']` | `true`  | The theme's layout grid, or overrides: fields apply at every breakpoint (`{ gutter: 8 }`), entries under a breakpoint name at that one only (`{ gutter: 8, lg: { columns: 16 } }`) |

## Custom CSS

The content slot uses `grid-column: 1 / -1` via `styled(View)` because `View` has no `gridColumn` prop; `1 / -1` spans every column whatever count the layout has at the current breakpoint.

## Nesting

Inside a flex or grid parent, a frame in the layout's `fixed` mode centres itself with `margin-inline: auto`, which makes it shrink to its content. Give it `width="100%"` in a flex column, or `mode: 'fluid'` when it is itself a grid item.
