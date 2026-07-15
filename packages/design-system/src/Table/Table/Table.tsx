import { useMemo, type ElementType, type TableHTMLAttributes } from 'react'
import { TableContext, type TableCellPadding } from '../TableContext'
import {
  styled,
  type Theme,
  type PaletteColor,
  createShouldForwardProp,
  props,
  space,
  layout,
  border,
  system,
  get,
  type SpaceProps,
  type LayoutProps,
  type BorderProps,
} from '../../index'

/** Valid values for the bg prop — derived from theme.background keys. */
export type TableBackgroundToken = keyof Theme['background']

/** Valid values for the size prop — derived from theme.sizes keys. */
export type TableSize = keyof Theme['sizes']

/** Valid values for the borderColor prop — derived from theme.border keys. */
export type TableBorderColorToken = keyof Theme['border']

export interface TableProps
  // `width` / `border` are deprecated presentational <table> attributes that
  // collide with the styled-system Layout/Border props — drop them here.
  extends
    Omit<
      TableHTMLAttributes<HTMLTableElement>,
      'color' | 'cellPadding' | 'align' | 'width' | 'border'
    >,
    SpaceProps<Theme>,
    LayoutProps<Theme>,
    Omit<BorderProps<Theme>, 'borderColor'> {
  /**
   * Palette color for descendant rows' hover/selected shading — broadcast to
   * `TableRow`s via `TableContext`; a row's own `color` wins.
   */
  color?: PaletteColor
  /** Resolves against theme.background */
  bg?: TableBackgroundToken
  /** Resolves against theme.border — light · primary · dark */
  borderColor?: TableBorderColorToken
  /** Cell density — broadcast to descendant `TableCell`s via `TableContext`. Default: 'md', overridable via `theme.defaults.size`. */
  size?: TableSize
  /** Cell padding mode — broadcast to descendant `TableCell`s. `'none'` zeroes cell padding. Default: `'normal'`. */
  cellPadding?: TableCellPadding
  /** Makes header cells stick to the top of a scrolling `TableContainer`. Default: `false`. */
  hasStickyHeader?: boolean
  /**
   * Hides inactive sort icons (revealed on hover/focus) — broadcast to
   * descendant `TableSortLabel`s via `TableContext`. Set `false` to keep them
   * always visible (dimmed). Default: `true`.
   */
  shouldHideSortIcon?: boolean
  /**
   * Truncates overflowing cell text with an ellipsis — broadcast to descendant
   * `TableCell`s via `TableContext`. Cells need a constrained width (e.g.
   * `maxWidth`) for the truncation to kick in. Default: `false`.
   */
  hasEllipsis?: boolean
  /** Default text alignment for every cell — cells with `align="inherit"` (the default) follow it. */
  align?: TableAlign
  as?: ElementType
}

/** Table-wide text alignment — inherited by head, body, and footer cells alike. */
export type TableAlign = 'left' | 'right' | 'center' | 'justify'

// `tableAlign`, not `align` — the intrinsic <table align> attribute (left|center|
// right) clashes with our TableAlign (adds 'justify'); it drives textAlign only.
interface TableBaseProps extends Omit<TableProps, 'align'> {
  tableAlign?: TableAlign
}

const shouldForwardProp = createShouldForwardProp([...props, 'tableAlign'])

// bg → theme.background (borderColor is handled by defaultBorder below so the
// frame and the descendant cascade always share one resolved color; `color` is
// broadcast-only and paints nothing on the table itself.)
const colorSystem = system({
  bg: { property: 'backgroundColor', scale: 'background' },
})

const alignStyle = ({ tableAlign }: TableBaseProps) => (tableAlign ? { textAlign: tableAlign } : {})

// `border-collapse: collapse` defeats `border-radius` — when a radius is
// requested, switch to the separate border model (spacing 0) and clip the
// cell corners so backgrounds follow the rounding.
const collapseStyle = ({ borderRadius }: TableProps) =>
  borderRadius
    ? ({ borderCollapse: 'separate', borderSpacing: 0, overflow: 'hidden' } as const)
    : ({ borderCollapse: 'collapse' } as const)

// Subtle default frame + color cascade: the table's borderColor flows to every
// descendant border (row dividers, custom cell/row borders). `:where()` keeps
// the cascade at class specificity, so a borderColor set on a child — whose
// class is inserted later — always wins. Children without a border width are
// unaffected (color alone paints nothing).
const defaultBorder = ({ theme, borderColor = 'light' }: TableProps & { theme?: Theme }) => {
  const color = get(theme, `border.${borderColor}`)
  return {
    border: `${get(theme, 'borderWidths.thin')} solid ${color}`,
    '& :where(thead, tbody, tfoot, tr, td, th)': { borderColor: color },
  }
}

// Render through a wrapper whose prop type omits the deprecated presentational
// <table align|width|border> attributes, so the styled-system Layout/Border
// props don't clash with them under `as` polymorphism. `shouldForwardProp`
// already keeps those styled-system props off the DOM at runtime.
const TableElement = (
  props: Readonly<Omit<TableHTMLAttributes<HTMLTableElement>, 'align' | 'width' | 'border'>>
) => <table {...props} />

const TableBase = styled(TableElement, {
  name: 'Table',
  label: 'Table',
  shouldForwardProp,
  systemProps: [space, layout, colorSystem, border],
})<TableBaseProps>({ width: '100%' }, collapseStyle, defaultBorder, alignStyle)

export function Table({
  // undefined resolves to themeDefault(theme, 'size', 'md') where the size is consumed.
  size,
  cellPadding = 'normal',
  hasStickyHeader = false,
  shouldHideSortIcon = true,
  hasEllipsis = false,
  color,
  align,
  as,
  children,
  ...rest
}: Readonly<TableProps>) {
  const value = useMemo(
    () => ({ size, cellPadding, hasStickyHeader, shouldHideSortIcon, hasEllipsis, color }),
    [size, cellPadding, hasStickyHeader, shouldHideSortIcon, hasEllipsis, color]
  )
  return (
    <TableContext.Provider value={value}>
      <TableBase as={as} tableAlign={align} {...rest}>
        {children}
      </TableBase>
    </TableContext.Provider>
  )
}
