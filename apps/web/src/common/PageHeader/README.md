# PageHeader

Gradient-backed page section wrapper. Renders a `Paper` surface (`bg="primary"`, relative, centered column) with a left linear-gradient backdrop and a centered `maxWidth="1280px"` content container. Shared by the `Hero`, `Articles`, and `Article` sections.

## Usage

```tsx
import { PageHeader } from 'src/common/PageHeader'

// Title-driven: heading renders in the Hero H1 style
;<PageHeader as="main" title="Articles">
  {/* content */}
</PageHeader>

// Children-driven: full custom composition (e.g. Hero)
;<PageHeader minHeight="620px">
  <Eyebrow>Principal Software Engineer</Eyebrow>
  <Typography variant="h1">...</Typography>
</PageHeader>
```

## Props

| Prop       | Type         | Default | Description                                                        |
| ---------- | ------------ | ------- | ------------------------------------------------------------------ |
| `title`    | `ReactNode`  | -       | Optional heading rendered with the Hero H1 style above `children`. |
| `children` | `ReactNode`  | -       | Content rendered inside the centered container.                    |
| `...rest`  | `PaperProps` | -       | Forwarded to the root `Paper` (`as`, `minHeight`, spacing, etc.).  |

## Title typography

When `title` is set it renders as `Typography variant="h1"` with `color="initial"`, `letterSpacing="tighter"`, `textTransform="uppercase"`, `lineHeight="tight"`, `m={0}` - matching the Hero heading. For richer headings (accent spans, line breaks), omit `title` and pass the heading as `children`.

## Custom CSS

| Component            | Why custom CSS is needed                                               |
| -------------------- | ---------------------------------------------------------------------- |
| `PageHeaderGradient` | `background-image: linear-gradient(...)` - no styled-system equivalent |
