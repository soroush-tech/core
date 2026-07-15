import { type CSSProperties, type ElementType } from 'react'
import { styled, type Theme, createShouldForwardProp, system, useTheme } from '../index'
import { Flex, type FlexProps } from '../Flex'
import { themeDefault } from '../utils/themeDefault'

export type PaperElevation =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24

export interface PaperProps extends FlexProps {
  /** Shadow depth — 0 (flat) to 24 (highest). Resolves to theme.shadows[n]. Default: 1. */
  elevation?: PaperElevation
  /** CSS aspect-ratio for fixed-ratio surfaces (e.g. 16/9, 1). */
  aspectRatio?: CSSProperties['aspectRatio']
  /** CSS transition for surface animations (e.g. hover elevation change). */
  transition?: CSSProperties['transition']
  /** Resolves against theme.border — light · primary · dark */
  borderColor?: keyof Theme['border']
  /** Resolves against theme.borderWidths — none · thin · base · thick */
  borderWidth?: keyof Theme['borderWidths']
  /** CSS border-style value (e.g. 'solid', 'dashed'). */
  borderStyle?: CSSProperties['borderStyle']
  /** Renders the surface as a different element (e.g. 'section'). */
  as?: ElementType
}

const shouldForwardProp = createShouldForwardProp([
  'elevation',
  'aspectRatio',
  'transition',
  'borderColor',
  'borderWidth',
  'borderStyle',
])

const paperSystem = system({
  elevation: { property: 'boxShadow', scale: 'shadows' },
  aspectRatio: { property: 'aspectRatio' },
  transition: { property: 'transition' },
  borderColor: { property: 'borderColor', scale: 'border' },
  borderWidth: { property: 'borderWidth', scale: 'borderWidths' },
  borderStyle: { property: 'borderStyle' },
})

const PaperRoot = styled(Flex, {
  name: 'Paper',
  label: 'paper',
  shouldForwardProp,
})<PaperProps>(paperSystem)

export function Paper({ elevation = 1, p = 2, bg, borderRadius, ...rest }: Readonly<PaperProps>) {
  const theme = useTheme()
  return (
    <PaperRoot
      elevation={elevation}
      p={p}
      bg={bg ?? themeDefault(theme, 'surfaceBg', 'paper')}
      borderRadius={borderRadius ?? themeDefault(theme, 'surfaceRadius', 'sq')}
      {...rest}
    />
  )
}
