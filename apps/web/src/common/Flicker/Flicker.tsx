import { keyframes } from '@emotion/react'
import { styled } from '@soroush.tech/design-system'
import { Flex, type FlexProps } from '@soroush.tech/design-system/Flex'

export type FlickerProps = FlexProps

// Suppressed-signal opacity flicker — a keyframe animation has no styled-system equivalent.
// The blink burst runs in the first ~20% of the cycle; the steady hold that follows is the
// per-cycle delay (animation-delay only pauses once, before the first iteration — not between).
const flicker = keyframes`
  0%, 8%, 20%, 100% { opacity: 0.7; }
  4%, 14%           { opacity: 1; }
`

/** A `Flex` wrapper that flickers its opacity in bursts — frames unstable/warning glyphs. */
export const Flicker = styled(Flex, { label: 'Flicker' })`
  animation: ${flicker} 2s infinite;
`
