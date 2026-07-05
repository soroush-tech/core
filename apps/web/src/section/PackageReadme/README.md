# PackageReadme

Renders a package's README markdown as page content on its package page.

## Props

| Prop     | Type     | Description                                |
| -------- | -------- | ------------------------------------------ |
| `readme` | `string` | Raw README markdown, imported with `?raw`. |

## Notes

- Delegates rendering to the shared `Markdown` component (every element → a theme primitive).
- `stripReadmeChrome` removes the leading `#` title and the badge block: the title is already
  shown in `PackageHero`, and the shields.io badge images are outside the page CSP `img-src`.
- Wrapped in a `Paper` surface, mirroring the `Article` section.
