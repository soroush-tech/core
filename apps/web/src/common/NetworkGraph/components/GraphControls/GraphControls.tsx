import styled from '@emotion/styled'
import { Button } from '@soroush.tech/design-system/Button'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Typography } from '@soroush.tech/design-system/Typography'

export interface GraphControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
}

// background.paper and border.primary don't map to Button's variant system — override via CSS.
const ControlButton = styled(Button)`
  width: 2.5rem;
  height: 2.5rem;
  background: ${({ theme }) => theme.background.paper};
  color: ${({ theme }) => theme.border.primary};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.background.modal};
  }

  & + & {
    margin-left: 0.5rem;
  }
`

export function GraphControls({ onZoomIn, onZoomOut, onReset }: Readonly<GraphControlsProps>) {
  return (
    <Flex flexDirection="row" position="absolute" bottom="2rem" left="2rem" zIndex={10}>
      <Flex>
        <Typography
          as="span"
          fontSize={10}
          letterSpacing="widest"
          textTransform="uppercase"
          display="block"
          mb={0.5}
          color="secondary"
        >
          Control_Interface
        </Typography>
        <Flex flexDirection="row">
          <ControlButton variant="text" shape="square" aria-label="Zoom in" onClick={onZoomIn}>
            +
          </ControlButton>
          <ControlButton variant="text" shape="square" aria-label="Zoom out" onClick={onZoomOut}>
            −
          </ControlButton>
          <ControlButton variant="text" shape="square" aria-label="Reset view" onClick={onReset}>
            ↻
          </ControlButton>
        </Flex>
      </Flex>
    </Flex>
  )
}
