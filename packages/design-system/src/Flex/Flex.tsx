import type { FlexboxProps } from '@soroush.tech/styled-system'
import { styled, type Theme, createShouldForwardProp, props, flexbox } from '../index'
import { View, type ViewProps } from '../View'

/** Valid values for the gap prop - derived from theme.space keys. */
export type GapToken = keyof Theme['space']

// `gap` needs no declaration or wiring here since @soroush.tech/styled-system 5.8.0 -
// it arrives through View's `space` parser and `SpaceProps`.
export interface FlexProps extends ViewProps, FlexboxProps<Theme> {}

const shouldForwardProp = createShouldForwardProp([...props])

export const Flex = styled(View, {
  name: 'Flex',
  label: 'flex',
  shouldForwardProp,
  systemProps: [flexbox],
})<FlexProps>({ display: 'flex', flexDirection: 'column' })
