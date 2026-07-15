import { keyframes } from '@emotion/react'
import { styled } from '@soroush.tech/design-system'
import {
  Typography,
  type TypographyProps,
  type TextColorToken,
} from '@soroush.tech/design-system/Typography'

export interface GlitchTextProps extends TypographyProps {
  /** theme.text token for the first RGB-split layer (also the glyph fill). Default: 'primary'. */
  color?: TextColorToken
  /** theme.text token for the second RGB-split layer. Default: 'error'. */
  secondaryColor?: TextColorToken
  /** Play the inverted (opposite) glitch keyframes. Default: false. */
  inverted?: boolean
}

// RGB-split glitch — no styled-system prop maps to an animated `text-shadow`. The two split
// colours are fed in as CSS custom properties (from the `color` / `secondaryColor` props,
// resolved against theme.text) so the keyframes stay token-driven. The two keyframe sets are
// offset/timing inverses of each other, so stacked instances don't jitter in lock-step.
const glitchRevers = keyframes`
  0%   { text-shadow: 2px 0 var(--glitch-a), -2px 0 var(--glitch-b); transform: translate(0); }
  2%   { text-shadow: -2px 0 var(--glitch-a), 2px 0 var(--glitch-b); transform: translate(-1px, 1px); }
  4%   { transform: translate(1px, -1px); }
  100% { text-shadow: 1px 0 var(--glitch-a), -1px 0 var(--glitch-b); transform: translate(0); }
`
const glitch = keyframes`
  0%   { text-shadow: -2px 0 var(--glitch-a), 2px 0 var(--glitch-b); transform: translate(-1px, 1px); }
  2%   { text-shadow: 2px 0 var(--glitch-a), -2px 0 var(--glitch-b); transform: translate(0); }
  4% { text-shadow: 1px 0 var(--glitch-a), -1px 0 var(--glitch-b); transform: translate(0); }
  100%   { transform: translate(1px, -1px); }
`

/**
 * Typography with a looping RGB-split glitch animation. Accepts every `Typography`
 * prop — pass `variant`, `color`, `fontSize`, `as`, etc. at the call site — plus
 * `color` / `secondaryColor` to pick the two split layers from theme.text, and `inverted`
 * to play the opposite glitch keyframes.
 */
export const GlitchText = styled(Typography, { label: 'GlitchText' })<GlitchTextProps>`
  --glitch-a: ${({ theme, color = 'primary' }) => theme.text[color]};
  --glitch-b: ${({ theme, secondaryColor = 'error' }) => theme.text[secondaryColor]};
  position: relative;
  user-select: none;
  animation: ${({ inverted }) => (inverted ? glitch : glitchRevers)} 2s infinite;
`
