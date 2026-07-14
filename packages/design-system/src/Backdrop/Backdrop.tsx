import { styled } from '../index'
import { View, type ViewProps } from '../View'

export type BackdropProps = ViewProps

// Full-viewport scrim. Sits behind the modal content (z-index -1) and is purely
// visual: `pointer-events: none` lets wheel and click pass through to the modal
// root, so the root (the scroll container in `scroll="body"`) handles both.
const BackdropRoot = styled(View, { label: 'Backdrop' })`
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
`

/**
 * @description Dimmed overlay rendered behind a modal's content. Defaults to the
 * theme `backdrop` background; forwards click and other props to the surface.
 */
export function Backdrop(props: Readonly<BackdropProps>) {
  return <BackdropRoot bg="backdrop" {...props} />
}
