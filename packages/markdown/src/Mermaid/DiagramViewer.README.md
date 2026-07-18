# DiagramViewer

Wraps a rendered diagram SVG in a zoom/pan viewport. Used internally by
[`Mermaid`](./README.md).

- **Controls (bottom-right):** a pan d-pad (up/down/left/right) around a reset, plus zoom in/out.
- **Expand (top-right):** opens the diagram in a fullscreen dialog (a design-system `Modal`).
- **Drag to pan.** The diagram is not text-selectable, so a pan-drag never flickers a selection.
- **Wheel to zoom — fullscreen only.** Inline, the wheel scrolls the page rather than the diagram
  hijacking it.
- Every glyph is a design-system [`Icon`](../../../design-system/src/Icon); no inline SVG.

The viewport grows with the diagram between a min and max height, then clips (pan/zoom/fullscreen
to see the rest). The control cluster sits above the (clipped) diagram, so a short diagram never
hides it.

## Props

| Prop         | Type      | Default | Description                                                         |
| ------------ | --------- | ------- | ------------------------------------------------------------------- |
| `svg`        | `string`  | —       | The rendered SVG markup to display. Required.                       |
| `expandable` | `boolean` | `true`  | Show the expand-to-fullscreen control and dialog.                   |
| `fill`       | `boolean` | `false` | Fill the parent's height — used by the nested viewer in the dialog. |
