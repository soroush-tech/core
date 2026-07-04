# @soroush.tech/styled-system

[![npm version](https://img.shields.io/npm/v/@soroush.tech/styled-system.svg)](https://www.npmjs.com/package/@soroush.tech/styled-system)
[![npm downloads](https://img.shields.io/npm/dm/@soroush.tech/styled-system.svg)](https://www.npmjs.com/package/@soroush.tech/styled-system)
[![coverage](https://codecov.io/gh/soroush-tech/soroush.tech/branch/main/graph/badge.svg?flag=styled-system)](https://app.codecov.io/gh/soroush-tech/soroush.tech?flags%5B0%5D=styled-system)
[![unpacked size](https://img.shields.io/npm/unpacked-size/@soroush.tech/styled-system.svg)](https://www.npmjs.com/package/@soroush.tech/styled-system)
[![types included](https://img.shields.io/npm/types/@soroush.tech/styled-system.svg)](https://www.npmjs.com/package/@soroush.tech/styled-system)
[![license](https://img.shields.io/npm/l/@soroush.tech/styled-system.svg)](./LICENSE)

A maintained, first-class-TypeScript rewrite of [styled-system](https://github.com/jxnblk/styled-system) v5 — responsive, theme-aware style props for CSS-in-JS.

It is a **drop-in replacement** for the `styled-system` runtime: the root export surface matches upstream verbatim, and the package ships its own types (replacing `@types/styled-system`).

## Features

- Add style props that hook into your own theme
- Quickly set responsive `font-size`, `margin`, `padding`, `width`, and more with props
- Influenced by constraint-based design-system principles
- Typographic scale, and a spacing scale for `margin` and `padding`
- Works with any color palette
- Works with most CSS-in-JS libraries, including [Emotion](https://emotion.sh) and [styled-components](https://styled-components.com)
- First-class TypeScript types — theme-scale-aware props, replacing `@types/styled-system`

## Install

```sh
# npm
npm install @soroush.tech/styled-system
```

```sh
# pnpm
pnpm add @soroush.tech/styled-system
```

```sh
# yarn
yarn add @soroush.tech/styled-system
```

`@emotion/is-prop-valid` (`^1.4.0`, peer) and `prop-types` (`^15.8.1`, optional peer) are
each used by a single [subpath](#subpath-imports) — `should-forward-prop` and `prop-types`
respectively. Install one only if you import that subpath. You bring your own CSS-in-JS
library (Emotion, styled-components, …); the core carries neither at runtime.

## Usage

```ts
// Example uses Emotion, but styled-system works with most other CSS-in-JS libraries as well
import styled from '@emotion/styled'
import { space, layout, typography, color } from '@soroush.tech/styled-system'

// Add styled-system functions to your component
const Box = styled.div`
  ${space}
  ${layout}
  ${typography}
  ${color}
`
```

Each style function exposes its own set of component props that handle styles based on values defined in a theme.

```tsx
// width: 50%
<Box width={1 / 2} />

// font-size: 20px (theme.fontSizes[4])
<Box fontSize={4} />

// margin: 16px (theme.space[2])
<Box m={2} />

// padding: 32px (theme.space[3])
<Box p={3} />

// color
<Box color="tomato" />

// color: #333 (theme.colors.gray[0])
<Box color="gray.0" />

// background-color
<Box bg="tomato" />
```

### Responsive style props

Set responsive `width`, `margin`, `padding`, `font-size`, and other properties with a shorthand array syntax. See [Responsive Styles](./docs/responsive-styles.md).

```tsx
// responsive width
<Box width={[1, 1 / 2, 1 / 4]} />

// responsive font-size
<Box fontSize={[2, 3, 4]} />

// responsive margin
<Box m={[1, 2, 3]} />

// responsive padding
<Box p={[1, 2, 3]} />
```

### Subpath imports

Subpaths mirror the original `@styled-system/*` packages:

```ts
import { css } from '@soroush.tech/styled-system/css'
import { themeGet } from '@soroush.tech/styled-system/theme-get'
import { pick, omit } from '@soroush.tech/styled-system/props'
import propTypes, { createPropTypes } from '@soroush.tech/styled-system/prop-types'
import shouldForwardProp, {
  createShouldForwardProp,
  props,
} from '@soroush.tech/styled-system/should-forward-prop'
```

## Drop-in via alias

Existing `styled-system` users can swap with a package-manager alias — no code changes:

```jsonc
"dependencies": {
  "styled-system": "npm:@soroush.tech/styled-system@^5"
}
```

The satellite `@styled-system/*` packages don't need separate aliases — import them as
subpaths off the aliased `styled-system` name, and they resolve through this package's
`exports`:

```ts
import themeGet from 'styled-system/theme-get'
import propTypes from 'styled-system/prop-types'
import { css } from 'styled-system/css'
import shouldForwardProp from 'styled-system/should-forward-prop'
```

Types resolve under both modern module resolution (`node16`/`nodenext`/`bundler`, via
`exports`) and classic `node` (via `typesVersions`).

## Documentation

Full docs live in [`docs/`](./docs/README.md):

- [Getting Started](https://github.com/soroush-tech/soroush.tech/tree/main/packages/styled-system/docs/getting-started.md)
- [Responsive Styles](https://github.com/soroush-tech/soroush.tech/tree/main/packages/styled-system/docs/responsive-styles.md)
- [How it Works](https://github.com/soroush-tech/soroush.tech/tree/main/packages/styled-system/docs/how-it-works.md)
- [Custom Props](https://github.com/soroush-tech/soroush.tech/tree/main/packages/styled-system/docs/custom-props.md)
- [Variants](https://github.com/soroush-tech/soroush.tech/tree/main/packages/styled-system/docs/variants.md)
- [API](https://github.com/soroush-tech/soroush.tech/tree/main/packages/styled-system/docs/api.md)
- [Reference Table](https://github.com/soroush-tech/soroush.tech/tree/main/packages/styled-system/docs/table.md)
- [TypeScript](https://github.com/soroush-tech/soroush.tech/tree/main/packages/styled-system/docs/typescript.md)
- [Guides](https://github.com/soroush-tech/soroush.tech/tree/main/packages/styled-system/docs/guides/index.md)

Runnable demos live in the [examples repo](https://github.com/soroush-tech/examples/tree/main/styled-system).

## License

MIT — a rewrite of styled-system (© 2017–2021 Brent Jackson), see [`LICENSE`](https://github.com/soroush-tech/soroush.tech/tree/main/packages/styled-system/LICENSE).
