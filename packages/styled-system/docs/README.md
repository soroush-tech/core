# Documentation

Full documentation for [`@soroush.tech/styled-system`](../README.md) — a maintained,
first-class-TypeScript rewrite of [styled-system](https://github.com/jxnblk/styled-system)
v5. It is a drop-in replacement for the `styled-system` runtime and ships its own types
(replacing `@types/styled-system`).

Ported and adapted from the original styled-system documentation.

## Introduction

- [Getting Started](./getting-started.md) — install, create a component, theming, margin/padding, layout
- [How it Works](./how-it-works.md) — the props-to-style-object pattern
- [Rationale](./rationale.md) — why style props and scales
- [TypeScript](./typescript.md) — typed, theme-scale-aware props (this package's headline feature)

## Core concepts

- [Responsive Styles](./responsive-styles.md) — mobile-first array & object syntax
- [Theming](./theming.md) — referencing theme values in props
- [Theme Specification](./theme-specification.md) — the full theme object shape and scales
- [Variants](./variants.md) — `variant`, `buttonStyle`, `textStyle`, `colorStyle`
- [Custom Style Props](./custom-props.md) — build your own with `system` and `compose`

## Reference

- [API](./api.md) — every style function and utility
- [Reference Table](./table.md) — every style prop, its CSS property, and theme scale
- [css / theme-get / props](./css.md) — the `/css`, `/theme-get`, `/props` subpath exports

## Guides

- [Build a Box](./guides/build-a-box.md)
- [Spacing](./guides/spacing.md)
- [Default Values](./guides/default-values.md)
- [Why Powers of Two](./guides/why-powers-of-two.md)
- [Removing Props from HTML](./guides/removing-props-from-html.md)
- [Theming](./guides/theming.md)
- [Array Scales](./guides/array-scales.md)
- [Array Props](./guides/array-props.md)
- [Color Modes](./guides/color-modes.md)
- [Component Types](./guides/component-types.md)
- [Scale Aliases](./guides/scale-aliases.md)
- [Migrating to v5](./guides/migrating.md)
- [Exceptions](./guides/exceptions.md)

## Package exports

This single package replaces the original family of `@styled-system/*` packages via
subpath exports:

| Import                                            | Original package                     |
| ------------------------------------------------- | ------------------------------------ |
| `@soroush.tech/styled-system`                     | `styled-system`                      |
| `@soroush.tech/styled-system/css`                 | `@styled-system/css`                 |
| `@soroush.tech/styled-system/theme-get`           | `@styled-system/theme-get`           |
| `@soroush.tech/styled-system/props`               | `@styled-system/props`               |
| `@soroush.tech/styled-system/should-forward-prop` | `@styled-system/should-forward-prop` |

## Examples

Runnable demos live in the [examples repo](https://github.com/soroush-tech/examples/tree/main/styled-system) —
`basic` (styled-components), `emotion`, `css`, `responsive-objects`, `theme-aliases`,
`svelte`, and `typescript` (typed, `tsc`-verified).
