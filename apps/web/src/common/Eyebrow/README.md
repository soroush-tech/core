# Eyebrow

A decorative label row - a 2px horizontal rule followed by a caption-style text label. Used to introduce sections or headings with a visual accent.

## Usage

```tsx
import { Eyebrow } from 'src/common/Eyebrow'
;<Eyebrow mb={3}>Principal Software Engineer</Eyebrow>
```

## Props

All `TypographyProps` are accepted and forwarded to the inner `Typography` element. Spacing props (`m`, `mt`, `mb`, `mx`, `my`, `mr`, `ml`) apply to the outer `Flex` container so the component itself can be spaced relative to sibling elements.

| Prop                              | Type                             | Default       | Description                                                  |
| --------------------------------- | -------------------------------- | ------------- | ------------------------------------------------------------ |
| `children`                        | `ReactNode`                      | -             | Label text                                                   |
| `variant`                         | `TypographyVariant`              | `'caption'`   | Typography variant                                           |
| `color`                           | `keyof Theme['text']`            | `'primary'`   | Text color token                                             |
| `fontFamily`                      | `keyof Theme['fonts']`           | `'mono'`      | Font family token                                            |
| `letterSpacing`                   | `keyof Theme['letterSpacings']`  | `'widest'`    | Letter spacing token                                         |
| `textTransform`                   | `CSSProperties['textTransform']` | `'uppercase'` | CSS text-transform                                           |
| `gap`                             | `GapToken`                       | `2`           | Space between rule and text (resolves against `theme.space`) |
| `m / mb / mt / mx / my / mr / ml` | `SpaceToken`                     | -             | Outer container spacing                                      |

## Custom CSS

`EyebrowRule` uses `background-color: theme.palette.primary.main` via `styled('span')` because the primary accent color lives in `theme.palette`, not in `theme.background`, making it inaccessible through the `bg` token prop.

## Colour reference

| Token             | Scale                        | Dark value          |
| ----------------- | ---------------------------- | ------------------- |
| `color="primary"` | `theme.text.primary`         | `kineticGreen[500]` |
| Rule colour       | `theme.palette.primary.main` | `kineticGreen[500]` |
