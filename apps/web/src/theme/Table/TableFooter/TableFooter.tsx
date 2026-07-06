import { type ElementType, type HTMLAttributes } from 'react'
import { TableSectionContext } from 'src/theme/Table/TableSectionContext'
import {
  styled,
  type Theme,
  createShouldForwardProp,
  props,
  space,
  border,
  system,
  type SpaceProps,
  type BorderProps,
} from 'src/theme'

/** Valid values for the color prop — derived from theme.text keys. */
export type TableFooterColorToken = keyof Theme['text']

/** Valid values for the bg prop — derived from theme.background keys. */
export type TableFooterBackgroundToken = keyof Theme['background']

/** Valid values for the borderColor prop — derived from theme.border keys. */
export type TableFooterBorderColorToken = keyof Theme['border']

export interface TableFooterProps
  extends
    Omit<HTMLAttributes<HTMLTableSectionElement>, 'color'>,
    SpaceProps<Theme>,
    Omit<BorderProps<Theme>, 'borderColor' | 'borderRadius'> {
  /** Resolves against theme.text */
  color?: TableFooterColorToken
  /** Resolves against theme.background */
  bg?: TableFooterBackgroundToken
  /** Resolves against theme.border — light · primary · dark */
  borderColor?: TableFooterBorderColorToken
  as?: ElementType
}

const shouldForwardProp = createShouldForwardProp([...props])

const colorSystem = system({
  color: { property: 'color', scale: 'text' },
  bg: { property: 'backgroundColor', scale: 'background' },
  borderColor: { property: 'borderColor', scale: 'border' },
})

const TableFooterBase = styled('tfoot', {
  label: 'TableFooter',
  shouldForwardProp,
})<TableFooterProps>(space, colorSystem, border)

export function TableFooter({ as, children, ...rest }: Readonly<TableFooterProps>) {
  return (
    <TableSectionContext.Provider value="footer">
      <TableFooterBase as={as} {...rest}>
        {children}
      </TableFooterBase>
    </TableSectionContext.Provider>
  )
}
