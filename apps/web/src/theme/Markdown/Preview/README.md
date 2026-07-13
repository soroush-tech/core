# Preview

Renders a markdown **string** with every element mapped to a design-system primitive — headings,
paragraphs, links, lists, GFM task-list checkboxes (`theme/Checkbox`), tables, blockquotes, images,
and syntax-highlighted fenced code blocks (`CodeBlock`, via `rehype-highlight`).

It is the read-only half of the `Markdown` compound and is also used on its own to render article /
README bodies.

## Props

| Prop        | Type               | Description                                                         |
| ----------- | ------------------ | ------------------------------------------------------------------- |
| `children`  | `string`           | The markdown source to render.                                      |
| `slotProps` | `PreviewSlotProps` | Per-element prop overrides, merged over the defaults (caller wins). |

```tsx
<Preview>{`# Title\n\nSome **bold** text.`}</Preview>
```

## Customising elements

`slotProps` overrides the props of **any** mapped element — keyed by the markdown tag: `h1`–`h6`,
`p`, `a`, `strong`, `em`, `ul`, `ol`, `li`, `code`, `blockquote`, `img`, `hr`, `th`, `td`, `pre`
(the code block wrapper), `input` (the task-list checkbox), and the table wrappers `table`,
`thead`, `tbody`, `tr`. Provided props are spread **after** the defaults, so common props like
`variant` / `color` / `textColor` win:

```tsx
<Preview
  slotProps={{
    p: { color: 'primary', variant: 'body2' },
    h1: { variant: 'h2' },
    a: { underline: 'always' },
  }}
>
  {source}
</Preview>
```

## Notes

- GFM is enabled (`remark-gfm`): tables, strikethrough, task lists, autolinks.
- Fenced code blocks render through `CodeBlock` — horizontally scrollable, themed to
  `theme.syntax`, with a copy-to-clipboard button.
