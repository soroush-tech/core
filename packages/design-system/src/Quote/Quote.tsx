import { styled } from '../index'
import { View, type ViewProps } from '../View'

export type QuoteProps = ViewProps

/** A View with a 2px primary left-border — used for terminal readouts and markdown blockquotes. */
export const Quote = styled(View, { label: 'Quote' })`
  border-left: 2px solid ${({ theme }) => theme.border.primary};
`
