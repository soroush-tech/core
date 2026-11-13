import { forestGreen, kineticGreen, kineticSurface, lightSurface } from 'src/theme/colors'
import { Card } from '@soroush.tech/design-system/Card'
import { ColorPalette } from 'src/theme/ColorPalette'
import { Flex } from '@soroush.tech/design-system/Flex'
import { useThemeMode } from 'src/theme/useThemeMode'
import { CardTitle } from './CardTitle'

export function ColorCard() {
  const { isDark } = useThemeMode()

  return (
    <Card variant="bracketBox" bg="paper" p={5} title={<CardTitle title="COLOR_SYSTEM" />}>
      <Flex flexDirection="row" gap={3}>
        <ColorPalette name="Primary" palette={isDark ? kineticGreen : forestGreen} />
        <ColorPalette name="Default" palette={isDark ? kineticSurface : lightSurface} />
      </Flex>
    </Card>
  )
}
