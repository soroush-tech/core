# css

```js
import { css } from '@soroush.tech/styled-system/css'
```

The `css` utility converts a theme-aware style object into a plain CSS-in-JS style
object. It resolves values against the [theme specification](./theme-specification.md)
scales (e.g. `color: 'primary'` → `theme.colors.primary`), supports the shorthand
prop aliases (`m`, `px`, `bg`, ...), and expands [responsive](./responsive-styles.md)
array / object values into media queries.

It returns a function of `theme` (or `props.theme`), so it slots directly into any
CSS-in-JS library:

```jsx
import styled from '@emotion/styled'
import { css } from '@soroush.tech/styled-system/css'

const Box = styled('div')(
  css({
    p: 4,
    bg: 'primary',
    color: 'white',
    borderRadius: 2,
    '&:hover': {
      bg: 'secondary',
    },
    fontSize: [2, 3, 4], // responsive
  })
)
```

Use it standalone too:

```js
css({ color: 'primary', m: 2 })(theme)
// → { color: theme.colors.primary, margin: theme.space[2] }
```

This is the engine behind the inline [`variant`](./variants.md) API.

## theme-get

```js
import { themeGet } from '@soroush.tech/styled-system/theme-get'
```

`themeGet` reads a single value from the theme by dot-path, with an optional
fallback. Handy inside template literals:

```jsx
import styled from '@emotion/styled'
import { themeGet } from '@soroush.tech/styled-system/theme-get'

const Button = styled('button')`
  color: ${themeGet('colors.primary', '#0077cc')};
  padding: ${themeGet('space.3')}px;
`
```

## props

```js
import { pick, omit } from '@soroush.tech/styled-system/props'
```

`pick` and `omit` split a props object by whether each key is a known style prop -
useful for forwarding only valid HTML attributes to the DOM. See also
[Removing props from HTML](./guides/removing-props-from-html.md) and
`@soroush.tech/styled-system/should-forward-prop`.
