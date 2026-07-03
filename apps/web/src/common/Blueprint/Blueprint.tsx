import { type ElementType } from 'react'
import { keyframes } from '@emotion/react'
import styled from '@emotion/styled'
import { Flex, type FlexProps } from 'src/theme/Flex'
import { alpha } from 'src/theme/utils'
import { useSpotlight } from './hooks/useSpotlight'

export interface BlueprintProps extends FlexProps {
  /** Renders a fixed scanline sweep animation. Default: false. */
  scanline?: boolean
  /** Renders a cursor-following radial highlight over the viewport. Default: true. */
  spotlight?: boolean
  /** Background pattern. 'line' = intersecting lines (default). 'dot' = radial dot grid. */
  variant?: 'line' | 'dot'
  as?: ElementType
}

const scanlineAnim = keyframes`
  0%   { top: 0; }
  100% { top: 100%; }
`

const BlueprintRoot = styled(Flex, { label: 'Blueprint' })<{ variant?: 'line' | 'dot' }>`
  position: relative;
  width: 100%;
  background-color: ${({ theme }) => theme.background.primary};
  color: ${({ theme }) => theme.text.initial};
  font-family: ${({ theme }) => theme.fonts.body};
  background-image: ${({ theme, variant = 'line' }) =>
    variant === 'dot'
      ? `radial-gradient(circle at 2px 2px, ${alpha(theme.border.primary, 0.2)} 1px, transparent 0)`
      : `linear-gradient(to right, ${alpha(theme.border.primary, 0.05)} 1px, transparent 1px),
         linear-gradient(to bottom, ${alpha(theme.border.primary, 0.05)} 1px, transparent 1px)`};
  background-size: 40px 40px;
`

// A cursor-following radial highlight. `useSpotlight` feeds it pointer coordinates
// via CSS custom properties so mouse movement never triggers a React re-render.
const Spotlight = styled('div', { label: 'Spotlight' })`
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image: radial-gradient(
    circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%),
    ${({ theme }) => alpha(theme.border.primary, 0.05)} 0%,
    transparent 40%
  );
`

const ScanlineLine = styled('span', { label: 'ScanlineLine' })`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  pointer-events: none;
  background-color: ${({ theme }) => alpha(theme.border.primary, 0.08)};
  animation: ${scanlineAnim} 8s linear infinite;
`

const Content = styled(Flex)`
  z-index: 1;
  flex-grow: 1;
`

export function Blueprint({
  scanline = false,
  spotlight = true,
  variant = 'line',
  height,
  overflow = 'hidden',
  children,
  ...rest
}: Readonly<BlueprintProps>) {
  const spotlightRef = useSpotlight()

  return (
    <BlueprintRoot height={height} overflow={overflow} variant={variant} {...rest}>
      {spotlight && <Spotlight ref={spotlightRef} aria-hidden />}
      {scanline && <ScanlineLine />}
      <Content>{children}</Content>
    </BlueprintRoot>
  )
}
