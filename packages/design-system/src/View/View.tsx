import { type CSSProperties, type HTMLAttributes } from 'react'
import type {
  SpaceProps,
  LayoutProps,
  TypographyProps as SystemTypographyProps,
  BorderProps,
  PositionProps,
  FlexboxProps,
} from '@soroush.tech/styled-system'
import {
  styled,
  type Theme,
  createShouldForwardProp,
  props,
  space,
  layout,
  typography,
  border,
  position,
  system,
} from '../index'

/** Valid values for the color prop - derived from theme.text keys. */
export type ViewColorToken = keyof Theme['text']

/** Valid values for the bg prop - derived from theme.background keys. */
export type ViewBackgroundToken = keyof Theme['background']

/** Valid values for the borderColor prop - derived from theme.border keys. */
export type ViewBorderColorToken = keyof Theme['border']

/** Valid values for the borderWidth prop - derived from theme.borderWidths keys. */
export type ViewBorderWidthToken = keyof Theme['borderWidths']

/** Valid theme tokens for border-radius. Raw CSS pixel values (e.g. '6px', '9999px') are also accepted. */
export type ViewBorderRadiusToken = keyof Theme['radii'] | `${number}px`

export interface ViewProps
  extends
    Omit<HTMLAttributes<HTMLElement>, 'color'>,
    SpaceProps<Theme>,
    LayoutProps<Theme>,
    SystemTypographyProps<Theme>,
    Omit<BorderProps<Theme>, 'borderColor' | 'borderWidth' | 'borderRadius'>,
    PositionProps<Theme> {
  bg?: ViewBackgroundToken
  /** Resolves against theme.border - light · primary · dark */
  borderColor?: ViewBorderColorToken
  /** Resolves against theme.borderWidths - none · thin · base · thick */
  borderWidth?: ViewBorderWidthToken
  /** Theme tokens: sq · sm · md · lg. Also accepts raw CSS pixel values e.g. '6px', '9999px'. */
  borderRadius?: ViewBorderRadiusToken
  opacity?: number
  cursor?: CSSProperties['cursor']
  /** CSS order for flex/grid item placement. Accepts responsive arrays. */
  order?: FlexboxProps<Theme>['order']
}

// aspectRatio needs no manual wiring since @soroush.tech/styled-system 5.8.0 - it
// arrives through the `layout` parser and `LayoutProps`.
const shouldForwardProp = createShouldForwardProp([...props, 'cursor', 'order'])

// bg → theme.background / borderColor → theme.border / opacity + cursor + order → raw
const colorSystem = system({
  bg: { property: 'backgroundColor', scale: 'background' },
  borderColor: { property: 'borderColor', scale: 'border' },
  opacity: { property: 'opacity' },
  cursor: { property: 'cursor' },
  order: { property: 'order' },
})

export const View = styled('div', {
  name: 'View',
  label: 'View',
  shouldForwardProp,
  systemProps: [space, layout, colorSystem, typography, border, position],
})<ViewProps>()
