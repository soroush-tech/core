import {
  styled,
  type Theme,
  createShouldForwardProp,
  props,
  flexbox,
  system,
  type FlexboxProps,
  type ResponsiveValue,
} from '../index'
import { View, type ViewProps } from '../View'

/** Valid values for the gap prop — derived from theme.space keys. */
export type GapToken = keyof Theme['space']

export interface FlexProps extends ViewProps, FlexboxProps<Theme> {
  /** Resolves against theme.space — maps to CSS gap. Accepts responsive arrays. */
  gap?: ResponsiveValue<GapToken>
}

// 'gap' is not in the default styled-system props list so must be added explicitly
// to prevent it from reaching the DOM as an HTML attribute.
const shouldForwardProp = createShouldForwardProp([...props, 'gap'])

const gapSystem = system({
  gap: { property: 'gap', scale: 'space' },
})

export const Flex = styled(View, {
  name: 'Flex',
  label: 'flex',
  shouldForwardProp,
  systemProps: [flexbox, gapSystem],
})<FlexProps>({ display: 'flex', flexDirection: 'column' })
