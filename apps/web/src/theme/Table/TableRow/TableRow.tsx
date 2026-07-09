import { useContext, type ElementType, type HTMLAttributes } from 'react'
import { TableContext } from 'src/theme/Table/TableContext'
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
} from 'src/theme'

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
   * to the enclosing `Table`'s `color`. Default: `'primary'`.
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
const hoverStyle = ({ isHoverable, color = 'primary', theme }: TableRowProps & { theme: Theme }) =>
  isHoverable
    ? {
        '&:hover': {
          backgroundColor: theme.palette[color].light,
          color: theme.palette[color].contrastText,
        },
      }
    : {}

const selectedStyle = ({
  isSelected,
  color = 'primary',
  theme,
}: TableRowProps & { theme: Theme }) =>
  isSelected
    ? { backgroundColor: theme.palette[color].dark, color: theme.palette[color].contrastText }
    : {}

const TableRowBase = styled('tr', { label: 'TableRow', shouldForwardProp })<TableRowProps>(
  space,
  colorSystem,
  border,
  selectedStyle,
  hoverStyle
)

export function TableRow({ color, ...rest }: Readonly<TableRowProps>) {
  // Resolution: explicit prop → enclosing Table's broadcast → 'primary' (in the style fns).
  const table = useContext(TableContext)
  return <TableRowBase color={color ?? table.color} {...rest} />
}
