import { Card } from '@soroush.tech/design-system/Card'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Typography } from '@soroush.tech/design-system/Typography'
import type { TextColorToken } from '@soroush.tech/design-system/Typography'

const COLORS: TextColorToken[] = [
  'initial',
  'primary',
  'secondary',
  'disabled',
  'error',
  'success',
  'info',
  'warning',
]

export function TypographyColorCard() {
  return (
    <Card
      variant="bracketBox"
      bg="paper"
      p={5}
      flex="1"
      title="TYPOGRAPHY_COLOR"
      caption="Each text color token mapped to a Typography body2 sample."
    >
      <Flex flexDirection="column" gap={2}>
        {COLORS.map((color) => (
          <Flex key={color} flexDirection="row" alignItems="baseline" gap={3}>
            <Typography
              variant="caption"
              color="secondary"
              fontFamily="mono"
              opacity={0.5}
              width="5rem"
              flexShrink={0}
              m={0}
            >
              {color}
            </Typography>
            <Typography variant="body2" color={color} m={0}>
              The quick brown fox jumps over the lazy dog
            </Typography>
          </Flex>
        ))}
      </Flex>
    </Card>
  )
}
