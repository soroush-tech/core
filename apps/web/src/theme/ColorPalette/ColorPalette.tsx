import { Flex } from '@soroush.tech/design-system/Flex'
import { Typography } from '@soroush.tech/design-system/Typography'
import { View } from '@soroush.tech/design-system/View'
import { luminance } from '@soroush.tech/design-system/utils'
import { Color } from './Color'

interface ColorPaletteProps {
  name: string
  palette: Record<string | number, string>
}

export function ColorPalette({ name, palette }: Readonly<ColorPaletteProps>) {
  const contrastText = luminance(palette.base) > 0.5 ? '#000000' : '#ffffff'

  return (
    <View borderRadius="md" overflow="hidden" width={288}>
      <Flex
        flexDirection="row"
        justifyContent="space-between"
        alignItems="flex-start"
        p={2}
        height="96px"
        style={{ backgroundColor: palette.base }}
      >
        <Typography fontWeight="bold" variant="overline" style={{ color: contrastText }}>
          {name}
        </Typography>
        <Typography variant="caption" fontFamily="mono" style={{ color: contrastText }}>
          {palette.base}
        </Typography>
      </Flex>
      <Flex flexDirection="row">
        {Object.entries(palette).map(([key, value]) => {
          if (key === 'base') return
          return <Color key={key} flex="1" color={value} height="48px" />
        })}
      </Flex>
    </View>
  )
}
