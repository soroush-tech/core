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
export type TableHeadColorToken = keyof Theme['text']

/** Valid values for the bg prop — derived from theme.background keys. */
export type TableHeadBackgroundToken = keyof Theme['background']

/** Valid values for the borderColor prop — derived from theme.border keys. */
export type TableHeadBorderColorToken = keyof Theme['border']

export interface TableHeadProps
  extends
    Omit<HTMLAttributes<HTMLTableSectionElement>, 'color'>,
    SpaceProps<Theme>,
    Omit<BorderProps<Theme>, 'borderColor' | 'borderRadius'> {
  /** Resolves against theme.text */
  color?: TableHeadColorToken
  /** Resolves against theme.background */
  bg?: TableHeadBackgroundToken
  /** Resolves against theme.border — light · primary · dark */
  borderColor?: TableHeadBorderColorToken
  as?: ElementType
}

const shouldForwardProp = createShouldForwardProp([...props])

const colorSystem = system({
  color: { property: 'color', scale: 'text' },
  bg: { property: 'backgroundColor', scale: 'background' },
  borderColor: { property: 'borderColor', scale: 'border' },
})

const TableHeadBase = styled('thead', {
  name: 'TableHead',
  label: 'TableHead',
  shouldForwardProp,
  systemProps: [space, colorSystem, border],
})<TableHeadProps>()

export function TableHead({ as, children, ...rest }: Readonly<TableHeadProps>) {
  return (
    <TableSectionContext.Provider value="head">
      <TableHeadBase as={as} {...rest}>
        {children}
      </TableHeadBase>
    </TableSectionContext.Provider>
  )
}
