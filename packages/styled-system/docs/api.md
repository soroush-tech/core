# API

## Space

```js
import { space } from '@soroush.tech/styled-system'
```

The space utility converts shorthand margin and padding props to margin and padding CSS declarations.

- Numbers from 0 to the length of `theme.space` are converted to values on the [space scale](#defaults).
- Negative values can be used for negative margins.
- Numbers greater than the length of the `theme.space` array are converted to raw pixel values.
- String values are passed as raw CSS values.
- And array values are converted into [responsive values][responsive-styles].

Margin and padding props follow a shorthand syntax for specifying direction.

| Prop                  | CSS Property                   |
| --------------------- | ------------------------------ |
| `margin`, `m`         | margin                         |
| `marginTop`, `mt`     | margin-top                     |
| `marginRight`, `mr`   | margin-right                   |
| `marginBottom`, `mb`  | margin-bottom                  |
| `marginLeft`, `ml`    | margin-left                    |
| `marginX`, `mx`       | margin-left and margin-right   |
| `marginY`, `my`       | margin-top and margin-bottom   |
| `padding`, `p`        | padding                        |
| `paddingTop`, `pt`    | padding-top                    |
| `paddingRight`, `pr`  | padding-right                  |
| `paddingBottom`, `pb` | padding-bottom                 |
| `paddingLeft`, `pl`   | padding-left                   |
| `paddingX`, `px`      | padding-left and padding-right |
| `paddingY`, `py`      | padding-top and padding-bottom |

```jsx
// examples (margin prop)

// sets margin value of `theme.space[2]`
<Box m={2} />

// sets margin value of `-1 * theme.space[2]`
<Box m={-2} />

// sets a margin value of `16px` since it's greater than `theme.space.length`
<Box m={16} />

// sets margin `'auto'`
<Box m='auto' />

// sets margin `8px` on all viewports and `16px` from the first breakpoint and up
<Box m={[ 2, 3 ]} />
```

As of v4.0.0, verbose margin and padding props (e.g. `margin`, `marginTop`) can also be used instead of the shorthand props.

## Color

```js
import { color } from '@soroush.tech/styled-system'
```

The color utility parses a component's `color` and `bg` props and converts them into CSS declarations.
By default the raw value of the prop is returned.
Color palettes can be configured with the [ThemeProvider][theming] to use keys as prop values, with support for dot notation.

| Prop                    | CSS Property     |
| ----------------------- | ---------------- |
| `color`                 | color            |
| `bg`, `backgroundColor` | background-color |
| `opacity`               | opacity          |

```jsx
// examples
// picks the value defined in `theme.colors.blue`
<Box color='blue' />

// picks up a nested color value using dot notation
// `theme.colors.gray[0]`
<Box color='gray.0' />

// raw CSS color value
<Box color='#f00' />

// background colors
<Box bg='blue' />

// verbose prop
<Box backgroundColor='blue' />
```

## Typography

```js
import { typography } from '@soroush.tech/styled-system'
```

The typography utility includes the following style props.

| Prop                      | CSS Property              |
| ------------------------- | ------------------------- |
| `fontFamily`              | font-family               |
| `fontSize`                | font-size                 |
| `fontWeight`              | font-weight               |
| `lineHeight`              | line-height               |
| `letterSpacing`           | letter-spacing            |
| `textAlign`               | text-align                |
| `fontStyle`               | font-style                |
| `textTransform`           | text-transform            |
| `textAlignLast`           | text-align-last           |
| `textDecoration`          | text-decoration           |
| `textDecorationLine`      | text-decoration-line      |
| `textDecorationStyle`     | text-decoration-style     |
| `textDecorationThickness` | text-decoration-thickness |
| `textDecorationColor`     | text-decoration-color     |

```jsx
// examples
// font-size of `theme.fontSizes[3]`
<Text fontSize={3} />

// font-size `32px`
<Text fontSize={32} />

// font-size `'2em'`
<Text fontSize='2em' />

// font-size `10px` on all viewports and `12px` from the first breakpoint and up
<Text fontSize={[ 10, 12 ]} />

// fontFamily
<Text fontFamily='mono' />

// textAlign
<Text textAlign='center' />
<Text textAlign={[ 'center', 'left' ]} />

// lineHeight
<Text lineHeight='1.25' />

// fontWeight
<Text fontWeight='bold' />

// letterSpacing
<Text letterSpacing='0.1em' />
```

## Layout

```js
import { layout } from '@soroush.tech/styled-system'
```

The layout utility includes the following style props.

| Prop            | CSS Property     |
| --------------- | ---------------- |
| `width`         | width            |
| `height`        | height           |
| `minWidth`      | min-width        |
| `maxWidth`      | max-width        |
| `minHeight`     | min-height       |
| `maxHeight`     | max-height       |
| `size`          | width and height |
| `display`       | display          |
| `verticalAlign` | vertical-align   |
| `overflow`      | overflow         |
| `overflowX`     | overflow-x       |
| `overflowY`     | overflow-y       |

The `width` prop is transformed based on the following:

- Numbers from 0-1 are converted to percentage widths.
- Numbers greater than 1 are converted to pixel values.
- String values are passed as raw CSS values.
- And arrays are converted to [responsive width styles][responsive-styles].
- If `theme.sizes` is defined, the `width` prop will attempt to pick up values from the theme

```jsx
// examples

// width `50%`
<Box width={1/2} />

// width `256px`
<Box width={256} />

// width `'2em'`
<Box width='2em' />

// width `100%` on all viewports and `50%` from the smallest breakpoint and up
<Box width={[ 1, 1/2 ]} />

// width from `theme.sizes`
<Box width='medium' />

// display
<Box display='inline-block' />
<Box display={[ 'block', 'inline-block' ]} />

// maxWidth
<Box maxWidth={1024} />
<Box maxWidth={[ 768, null, null, 1024 ]} />

// minWidth
<Box minWidth={128} />
<Box minWidth={[ 96, 128 ]} />

// height
<Box height={64} />
<Box height={[ 48, 64 ]} />

// maxHeight
<Box maxHeight={512} />
<Box maxHeight={[ 384, 512 ]} />

// minHeight
<Box minHeight={512} />
<Box minHeight={[ 384, 512 ]} />

// size (width & height)
<Box size={32} />
<Box size={[ 32, 48 ]} />

// overflow
<Box overflow='hidden' />

// overflowX
<Box overflowX='hidden' />

// overflowY
<Box overflowY='hidden' />
```

## Flexbox

```js
import { flexbox } from '@soroush.tech/styled-system'
```

The `flexbox` utility includes the following style props.

| Prop             | CSS Property    |
| ---------------- | --------------- |
| `alignItems`     | align-items     |
| `alignContent`   | align-content   |
| `justifyItems`   | justify-items   |
| `justifyContent` | justify-content |
| `flexWrap`       | flex-wrap       |
| `flexDirection`  | flex-direction  |
| `flex`           | flex            |
| `flexGrow`       | flex-grow       |
| `flexShrink`     | flex-shrink     |
| `flexBasis`      | flex-basis      |
| `justifySelf`    | justify-self    |
| `alignSelf`      | align-self      |
| `order`          | order           |

```jsx
// alignItems
<Flex alignItems='center' />

// alignContent
<Flex alignContent='center' />

// justifyContent
<Flex justifyContent='center' />

// flexWrap
<Flex flexWrap='wrap' />

// flexBasis
<Flex flexBasis='auto' />

// flexDirection
<Flex flexDirection='column' />

// flex
<Box flex='1 1 auto' />

// justifySelf
<Box justifySelf='center' />

// alignSelf
<Box alignSelf='center' />

// order
<Box order='2' />
```

## Grid Layout

```js
import { grid } from '@soroush.tech/styled-system'
```

The `grid` utility includes the following style props.

| Prop                  | CSS Property          |
| --------------------- | --------------------- |
| `gridGap`             | grid-gap              |
| `gridColumnGap`       | grid-column-gap       |
| `gridRowGap`          | grid-row-gap          |
| `gridColumn`          | grid-column           |
| `gridRow`             | grid-row              |
| `gridAutoFlow`        | grid-auto-flow        |
| `gridAutoColumns`     | grid-auto-columns     |
| `gridAutoRows`        | grid-auto-rows        |
| `gridTemplateColumns` | grid-template-columns |
| `gridTemplateRows`    | grid-template-rows    |
| `gridTemplateAreas`   | grid-template-areas   |
| `gridArea`            | grid-area             |

```jsx
// gridGap
<Box gridGap={10} />
<Box gridGap={[ 1, 2 ]} />

// gridColumnGap
<Box gridColumnGap={10} />
<Box gridColumnGap={[ 1, 2 ]} />

// gridRowGap
<Box gridRowGap={10} />
<Box gridRowGap={[ 1, 2 ]} />

// gridColumn
<Box gridColumn={1} />

// gridRow
<Box gridRow={1} />

// gridAutoFlow
<Box gridAutoFlow='row' />

// gridAutoColumns
<Box gridAutoColumns='auto' />

// gridAutoRows
<Box gridAutoRows='auto' />

// gridTemplateColumns
<Box gridTemplateColumns='1fr 2fr' />

// gridTemplateRows
<Box gridTemplateRows='auto' />

// gridTemplateAreas
<Box gridTemplateAreas='a b' />

// gridArea
<Box gridArea='a' />
```

## Background

```js
import { background } from '@soroush.tech/styled-system'
```

The `background` utility includes the following style props.

| Prop                               | CSS Property        |
| ---------------------------------- | ------------------- |
| `background`                       | background          |
| `backgroundImage`, `bgImage`       | background-image    |
| `backgroundSize`, `bgSize`         | background-size     |
| `backgroundPosition`, `bgPosition` | background-position |
| `backgroundRepeat`, `bgRepeat`     | background-repeat   |

```jsx
// example
<Box
  backgroundImage="url('kitten.png')"
  backgroundSize="cover"
  backgroundPosition="center"
  backgroundRepeat="repeat-x"
/>
```

## Border

```js
import { border } from '@soroush.tech/styled-system'
```

The `border` utility includes the following style props.

| Prop                      | CSS Property                 |
| ------------------------- | ---------------------------- |
| `border`                  | border                       |
| `borderWidth`             | border-width                 |
| `borderStyle`             | border-style                 |
| `borderColor`             | border-color                 |
| `borderRadius`            | border-radius                |
| `borderTop`               | border-top                   |
| `borderTopWidth`          | border-top-width             |
| `borderTopStyle`          | border-top-style             |
| `borderTopColor`          | border-top-color             |
| `borderTopLeftRadius`     | border-top-left-radius       |
| `borderTopRightRadius`    | border-top-right-radius      |
| `borderRight`             | border-right                 |
| `borderRightWidth`        | border-right-width           |
| `borderRightStyle`        | border-right-style           |
| `borderRightColor`        | border-right-color           |
| `borderBottom`            | border-bottom                |
| `borderBottomWidth`       | border-bottom-width          |
| `borderBottomStyle`       | border-bottom-style          |
| `borderBottomColor`       | border-bottom-color          |
| `borderBottomLeftRadius`  | border-bottom-left-radius    |
| `borderBottomRightRadius` | border-bottom-right-radius   |
| `borderLeft`              | border-left                  |
| `borderLeftWidth`         | border-left-width            |
| `borderLeftStyle`         | border-left-style            |
| `borderLeftColor`         | border-left-color            |
| `borderX`                 | border-left and border-right |
| `borderY`                 | border-top and border-bottom |

```jsx
<Box border='1px solid' />
<Box borderTop='1px solid' />
<Box borderRight='1px solid' />
<Box borderBottom='1px solid' />
<Box borderLeft='1px solid' />

// borderWidth
<Box borderWidth='4px' />

// borderStyle
<Box borderStyle='dotted' />

// borderColor
<Box borderColor='blue' />

// borderRadius
<Box borderRadius={4} />
```

## Position

```js
import { position } from '@soroush.tech/styled-system'
```

The `position` utility includes the following style props.

| Prop       | CSS Property |
| ---------- | ------------ |
| `position` | position     |
| `zIndex`   | z-index      |
| `top`      | top          |
| `right`    | right        |
| `bottom`   | bottom       |
| `left`     | left         |

```jsx
// position
<Box position='absolute' />

// zIndex
<Absolute zIndex={2} />

// top, right, bottom, left
<Fixed
  top='0'
  right='0'
  bottom='0'
  left='0'
/>
```

## Shadow

```js
import { shadow } from '@soroush.tech/styled-system'
```

The `shadow` utility includes the following style props.

| Prop         | CSS Property |
| ------------ | ------------ |
| `textShadow` | text-shadow  |
| `boxShadow`  | box-shadow   |

```jsx
<Box textShadow="small" boxShadow="medium" />
```

---

## Compose

The `compose` utility is used to combine multiple style functions together into one.
This utility can help improve performance when using multiple style props functions on the same component.

```js
import styled from 'styled-components'
import { compose, typography, space, color } from '@soroush.tech/styled-system'

export const Text = styled('div')(compose(typography, space, color))
```

<!--
### themeGet

The `themeGet` function is an existential getter function
that can be used in any style declaration to get a value
from your theme, with support for fallback values.
This helps prevent errors from throwing when a theme value is missing,
which can be helpful when unit testing styled-components.

```js
themeGet(objectPath, fallbackValue)(props)
```

`themeGet` returns a function that accepts props as an argument
(`themeGet(objectPath)(props)`), which when used in a tagged template
literal should look like this:

```js
import styled from 'styled-components'
import { themeGet } from '@soroush.tech/styled-system/theme-get'

const Box = styled.div`
  border-radius: ${themeGet('radii.small', '4px')};
`
```

When used with object literal syntax, `themeGet` needs to be in a
function call and have `props` passed to it:

```js
import styled from 'styled-components'
import { themeGet } from '@soroush.tech/styled-system/theme-get'

const Box = styled('div')(props => ({
  borderRadius: themeGet('radii.small', '4px')(props),
}))
```

-->

<!--
### propTypes

Prop type definitions are available for each style function to add to your component's propTypes object.
Each value in `propTypes` is an object which should be assigned (or spread) to the component's `propTypes`.

```jsx
import styled from 'styled-components'
import { width } from '@soroush.tech/styled-system'

const Box = styled.div`
  ${width}
`

Box.propTypes = {
  ...width.propTypes,
}
```
-->

---

## System

To create custom props for other CSS properties, use the `system` low-level utility.
The `system` function takes a configuration object as its only argument and returns a style function that can be used like any other Styled System function.
Each key in the configuration object can define the following:

- `property`: the CSS property to use in the returned style object
- `properties`: an array of multiple properties (e.g. `[ 'marginLeft', 'marginRight' ]`)
- `scale`: a string referencing a key in the `theme` object
- `transform`: a function to transform the raw value based on the scale
- `defaultScale` a fallback scale object for when there isn't one defined in the `theme` object

```js
// example
import styled from 'styled-components'
import { system } from '@soroush.tech/styled-system'

const Text = styled('div')(
  system({
    fontSize: {
      property: 'fontSize',
      scale: 'fontSizes',
      defaultScale: [12, 14, 16, 20, 24, 32, 48],
    },
    lineHeight: {
      property: 'lineHeight',
      scale: 'lineHeights',
    },
    // shorthand definition
    textAlign: true,
  })
)
```

By default, Styled System will return either a value from the theme, based on a key, or the raw value.
To change how a style prop value is transformed, provide a custom `transform` function.
The function takes two arguments: `(value, scale)`, where `value` is the raw prop value, and `scale` is a theme scale object or array.

## Variant

Creates a custom style utility to apply complex styles based on a single prop.

```js
import styled from 'styled-components'
import { variant } from '@soroush.tech/styled-system'

const Card = styled.div`
  ${variant({
    variants: {
      normal: {
        p: 2,
        boxShadow: 'default',
        borderRadius: 2,
      },
      large: {
        p: 3,
        boxShadow: 'large',
        borderRadius: 4,
      },
    },
  })}
`
Card.defaultProps = {
  variant: 'normal',
}
// <Card variant='large' />
```

## Legacy Variants

The legacy variants require styles to be defined in the theme object and do _not_ use `@soroush.tech/styled-system/css` for transformation.

```js
import { textStyle, colorStyle, buttonStyle } from '@soroush.tech/styled-system'
```

```jsx
// textStyle
<Text textStyle='caps' />

// colorStyle
<Box colors='warning' />

// buttonStyle
<Button variant='primary' />
```

---

## Defaults

Some style props include default, fallback scales if not defined in the `theme` object.

```js
// Default Breakpoints
const breakpoints = ['40em', '52em', '64em']
// @media screen and (min-width: 40em)
// @media screen and (min-width: 52em)
// @media screen and (min-width: 64em)

// default fontSizes
const fontSizes = [12, 14, 16, 20, 24, 32, 48, 64, 72]

// default space for margin and padding
const space = [0, 4, 8, 16, 32, 64, 128, 256, 512]
```

[responsive-styles]: ./responsive-styles.md
[theming]: ./getting-started.md#theming
