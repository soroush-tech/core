import { useContext, type ElementType, type ThHTMLAttributes } from 'react'
import { TableContext, type TableCellPadding } from '../TableContext'
import { TableSectionContext, type TableSection } from '../TableSectionContext'
import {
  styled,
  type Theme,
  createShouldForwardProp,
  props,
  space,
  typography,
  border,
  system,
  get,
  type SpaceProps,
  type TypographyProps as SystemTypographyProps,
  type BorderProps,
} from '../../index'
import { themeDefault } from '../../utils/themeDefault'

/** Cell type — inherited from the enclosing section, overridable per cell. */
export type TableCellVariant = TableSection

export type TableCellAlign = 'left' | 'right' | 'center' | 'justify' | 'inherit'

export type TableCellSortDirection = 'asc' | 'desc'

/** Valid values for the color prop — derived from theme.text keys. */
export type TableCellColorToken = keyof Theme['text']

/** Valid values for the bg prop — derived from theme.background keys. */
export type TableCellBackgroundToken = keyof Theme['background']

/** Valid values for the borderColor prop — derived from theme.border keys. */
export type TableCellBorderColorToken = keyof Theme['border']

export interface TableCellProps
  extends
    Omit<ThHTMLAttributes<HTMLTableCellElement>, 'color' | 'align'>,
    SpaceProps<Theme>,
    SystemTypographyProps<Theme>,
    Omit<BorderProps<Theme>, 'borderColor' | 'borderRadius'> {
  /** Resolves against theme.text */
  color?: TableCellColorToken
  /** Resolves against theme.background */
  bg?: TableCellBackgroundToken
  /** Resolves against theme.border — light · primary · dark */
  borderColor?: TableCellBorderColorToken
  /** Cell type — overrides the enclosing `TableHead`/`TableBody`/`TableFooter` section. */
  variant?: TableCellVariant
  /** Text alignment of the cell content. Numbers should be right-aligned. Default: `'inherit'`. */
  align?: TableCellAlign
  /** Cell density — overrides the `Table`'s `size`. Resolves against `theme.sizes`. */
  size?: keyof Theme['sizes']
  /** Cell padding mode — overrides the `Table`'s `cellPadding`. `'none'` zeroes padding. */
  cellPadding?: TableCellPadding
  /** Sets `aria-sort` on the cell — a11y only, pair with `TableSortLabel` for the control. */
  sortDirection?: TableCellSortDirection
  /**
   * Truncates overflowing text with an ellipsis — inherits the `Table`'s
   * `hasEllipsis`. Needs a constrained width (e.g. `maxWidth`) to kick in.
   */
  hasEllipsis?: boolean
  as?: ElementType
}

// `cellAlign`, not `align` — the intrinsic <td>/<th> `align` attribute
// (left|center|right|justify|char) clashes with our `align` (adds 'inherit');
// it drives textAlign only and is never forwarded to the DOM.
interface TableCellBaseProps extends Omit<TableCellProps, 'align'> {
  /** Resolved from `TableContext.hasStickyHeader` for header cells. */
  isSticky?: boolean
  cellAlign?: TableCellAlign
}

const shouldForwardProp = createShouldForwardProp([
  ...props,
  'cellAlign',
  'cellPadding',
  'hasEllipsis',
  'isSticky',
  'variant',
])

const colorSystem = system({
  color: { property: 'color', scale: 'text' },
  bg: { property: 'backgroundColor', scale: 'background' },
  borderColor: { property: 'borderColor', scale: 'border' },
})

// size → theme.sizes density (padding + fontSize); cellPadding 'none' zeroes the box.
const sizeStyle = ({
  theme,
  size,
  cellPadding = 'normal',
}: TableCellBaseProps & { theme: Theme }) => {
  const s = theme.sizes[size ?? themeDefault(theme, 'size', 'md')]
  const fontSize = theme.fontSizes[s.fontSize]
  if (cellPadding === 'none') return { padding: 0, fontSize }
  return {
    paddingTop: theme.space[s.paddingTop],
    paddingBottom: theme.space[s.paddingBottom],
    paddingLeft: theme.space[s.paddingLeft],
    paddingRight: theme.space[s.paddingRight],
    fontSize,
  }
}

// Always emitted: `inherit` overrides the browser's default `<th>` centering so
// header and body cells align the same, following the enclosing Table's `align`.
const alignStyle = ({ cellAlign = 'inherit' }: TableCellBaseProps) => ({ textAlign: cellAlign })

// Same truncation trio as Typography's noWrap.
const ellipsisStyle = ({ hasEllipsis }: TableCellBaseProps) =>
  hasEllipsis ? { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } : {}

// Row divider — cells carry a default bottom border because `<tr>` borders
// don't render in the separate border model (used when the Table is rounded).
// Width/style only: the color cascades from the enclosing Table's borderColor,
// and a cell's own borderColor prop overrides it.
const dividerStyle = ({ theme }: { theme?: Theme }) => ({
  borderBottomWidth: get(theme, 'borderWidths.thin'),
  borderBottomStyle: 'solid' as const,
})

// Sticky headers need an opaque default background so scrolled rows don't bleed
// through. Declared before colorSystem so an explicit `bg` prop overrides it.
const stickyStyle = ({ isSticky, theme }: TableCellBaseProps & { theme?: Theme }) =>
  isSticky
    ? ({ position: 'sticky', top: 0, backgroundColor: get(theme, 'background.paper') } as const)
    : {}

const TableCellBase = styled('td', {
  name: 'TableCell',
  label: 'TableCell',
  shouldForwardProp,
  systemProps: [space, colorSystem, typography, border],
})<TableCellBaseProps>(sizeStyle, dividerStyle, stickyStyle, ellipsisStyle, alignStyle)

export function TableCell({
  variant,
  align = 'inherit',
  size,
  cellPadding,
  sortDirection,
  hasEllipsis,
  scope,
  as,
  children,
  ...rest
}: Readonly<TableCellProps>) {
  const section = useContext(TableSectionContext)
  const table = useContext(TableContext)

  const resolvedVariant = variant ?? section ?? 'body'
  const isHead = resolvedVariant === 'head'
  const element = as ?? (isHead ? 'th' : 'td')

  return (
    <TableCellBase
      as={element}
      variant={resolvedVariant}
      cellAlign={align}
      size={size ?? table.size}
      cellPadding={cellPadding ?? table.cellPadding}
      hasEllipsis={hasEllipsis ?? table.hasEllipsis}
      isSticky={isHead && Boolean(table.hasStickyHeader)}
      scope={scope ?? (isHead ? 'col' : undefined)}
      aria-sort={sortDirection && (sortDirection === 'asc' ? 'ascending' : 'descending')}
      {...rest}
    >
      {children}
    </TableCellBase>
  )
}
