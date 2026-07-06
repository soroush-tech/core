import { type HTMLAttributes } from 'react'
import {
  styled,
  type Theme,
  createShouldForwardProp,
  props,
  space,
  border,
  system,
  get,
  type SpaceProps,
  type BorderProps,
} from 'src/theme'

/** Valid values for the color prop — derived from theme.text keys. */
export type TableRowColorToken = keyof Theme['text']

/** Valid values for the bg prop — derived from theme.background keys. */
export type TableRowBackgroundToken = keyof Theme['background']

/** Valid values for the borderColor prop — derived from theme.border keys. */
export type TableRowBorderColorToken = keyof Theme['border']

export interface TableRowProps
  extends
    Omit<HTMLAttributes<HTMLTableRowElement>, 'color'>,
    SpaceProps<Theme>,
    Omit<BorderProps<Theme>, 'borderColor' | 'borderRadius'> {
  /** Resolves against theme.text */
  color?: TableRowColorToken
  /** Resolves against theme.background */
  bg?: TableRowBackgroundToken
  /** Resolves against theme.border — light · primary · dark */
  borderColor?: TableRowBorderColorToken
  /** Shades the row on hover with `theme.background.secondary`. Default: `false`. */
  isHoverable?: boolean
  /** Applies the selected shading (`theme.background.grid`). Default: `false`. */
  isSelected?: boolean
}

const shouldForwardProp = createShouldForwardProp([...props, 'isHoverable', 'isSelected'])

const colorSystem = system({
  color: { property: 'color', scale: 'text' },
  bg: { property: 'backgroundColor', scale: 'background' },
  borderColor: { property: 'borderColor', scale: 'border' },
})

const hoverStyle = ({ isHoverable, theme }: TableRowProps & { theme?: Theme }) =>
  isHoverable ? { '&:hover': { backgroundColor: get(theme, 'background.secondary') } } : {}

const selectedStyle = ({ isSelected, theme }: TableRowProps & { theme?: Theme }) =>
  isSelected ? { backgroundColor: get(theme, 'background.grid') } : {}

export const TableRow = styled('tr', { label: 'TableRow', shouldForwardProp })<TableRowProps>(
  space,
  colorSystem,
  border,
  selectedStyle,
  hoverStyle
)
