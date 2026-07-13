# Toolbar

The formatting toolbar of the `Markdown` compound. It dispatches actions through `Markdown`
context, so it **must be rendered inside `<Control>`**. It takes no props.

## Controls

- **Inline marks** — bold, italic, strikethrough (joined cluster; the labels mirror the mark),
  inline code (`<>`). These toggle off when re-applied and nest cleanly.
- **Heading select** — H1–H6; picking a level replaces any current heading.
- **Blockquote**, and a joined **bulleted / numbered / task** list cluster — mutually exclusive,
  toggle on/off.
- **Link**, **Image**.
- **Code-block language select** — inserts a ` ```lang ` fence.
- **Table picker** (`TablePicker`) — a hover grid for choosing table dimensions.

All transform logic lives in `utils/applyAction` and the action data in `const.ts`.

```tsx
<Control value={value} onChange={setValue}>
  <Toolbar />
  <Editor />
</Control>
```
