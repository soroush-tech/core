import { type ElementType, type HTMLAttributes } from 'react'
import { TableSectionContext } from '../TableSectionContext'
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
} from '@soroush.tech/design-system'

/** Valid values for the color prop — derived from theme.text keys. */
export type TableBodyColorToken = keyof Theme['text']

/** Valid values for the bg prop — derived from theme.background keys. */
export type TableBodyBackgroundToken = keyof Theme['background']

/** Valid values for the borderColor prop — derived from theme.border keys. */
export type TableBodyBorderColorToken = keyof Theme['border']

export interface TableBodyProps
  extends
    Omit<HTMLAttributes<HTMLTableSectionElement>, 'color'>,
    SpaceProps<Theme>,
    Omit<BorderProps<Theme>, 'borderColor' | 'borderRadius'> {
  /** Resolves against theme.text */
  color?: TableBodyColorToken
  /** Resolves against theme.background */
  bg?: TableBodyBackgroundToken
  /** Resolves against theme.border — light · primary · dark */
  borderColor?: TableBodyBorderColorToken
  as?: ElementType
}

const shouldForwardProp = createShouldForwardProp([...props])

const colorSystem = system({
  color: { property: 'color', scale: 'text' },
  bg: { property: 'backgroundColor', scale: 'background' },
  borderColor: { property: 'borderColor', scale: 'border' },
})

const TableBodyBase = styled('tbody', {
  name: 'TableBody',
  label: 'TableBody',
  shouldForwardProp,
  systemProps: [space, colorSystem, border],
})<TableBodyProps>()

export function TableBody({ as, children, ...rest }: Readonly<TableBodyProps>) {
  return (
    <TableSectionContext.Provider value="body">
      <TableBodyBase as={as} {...rest}>
        {children}
      </TableBodyBase>
    </TableSectionContext.Provider>
  )
}
