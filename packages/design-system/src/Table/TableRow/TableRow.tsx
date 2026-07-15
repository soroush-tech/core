import { useContext, type ElementType, type HTMLAttributes } from 'react'
import { TableContext } from '../TableContext'
import {
  styled,
  type Theme,
  type PaletteColor,
  createShouldForwardProp,
  props,
  space,
  border,
  system,
  type SpaceProps,
  type BorderProps,
} from '../../index'
import { themeDefault } from '../../utils/themeDefault'

/** Palette color driving the hover/selected shading — a `theme.palette` key. */
export type TableRowColor = PaletteColor

/** Valid values for the bg prop — derived from theme.background keys. */
export type TableRowBackgroundToken = keyof Theme['background']

/** Valid values for the borderColor prop — derived from theme.border keys. */
export type TableRowBorderColorToken = keyof Theme['border']

export interface TableRowProps
  extends
    Omit<HTMLAttributes<HTMLTableRowElement>, 'color'>,
    SpaceProps<Theme>,
    Omit<BorderProps<Theme>, 'borderColor' | 'borderRadius'> {
  /**
   * Palette color for the hover/selected shading — maps to `theme.palette[color]`
   * (hover → `.light`, selected → `.dark`, both with `contrastText`). Falls back
   * to the enclosing `Table`'s `color`. Default: 'primary', overridable via `theme.defaults.color`.
   */
  color?: TableRowColor
  as?: ElementType
  /** Resolves against theme.background */
  bg?: TableRowBackgroundToken
  /** Resolves against theme.border — light · primary · dark */
  borderColor?: TableRowBorderColorToken
  /** Shades the row on hover with `theme.palette[color].light`. Default: `false`. */
  isHoverable?: boolean
  /** Fills the row with `theme.palette[color].dark` + contrast text. Default: `false`. */
  isSelected?: boolean
}

const shouldForwardProp = createShouldForwardProp([...props, 'isHoverable', 'isSelected'])

const colorSystem = system({
  bg: { property: 'backgroundColor', scale: 'background' },
  borderColor: { property: 'borderColor', scale: 'border' },
})

// Hover/selected fill the row from the palette (like Button): the light shade on
// hover, the dark shade when selected, both paired with the palette's contrastText.
const hoverStyle = ({ isHoverable, color, theme }: TableRowProps & { theme: Theme }) => {
  const c = theme.palette[color ?? themeDefault(theme, 'color', 'primary')]
  return isHoverable
    ? {
        '&:hover': {
          backgroundColor: c.light,
          color: c.contrastText,
        },
      }
    : {}
}

const selectedStyle = ({ isSelected, color, theme }: TableRowProps & { theme: Theme }) => {
  const c = theme.palette[color ?? themeDefault(theme, 'color', 'primary')]
  return isSelected ? { backgroundColor: c.dark, color: c.contrastText } : {}
}

const TableRowBase = styled('tr', {
  name: 'TableRow',
  label: 'TableRow',
  shouldForwardProp,
  systemProps: [space, colorSystem, border],
})<TableRowProps>(selectedStyle, hoverStyle)

export function TableRow({ color, ...rest }: Readonly<TableRowProps>) {
  // Resolution: explicit prop → enclosing Table's broadcast → 'primary' (in the style fns).
  const table = useContext(TableContext)
  return <TableRowBase color={color ?? table.color} {...rest} />
}
