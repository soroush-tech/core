import { STORYBOOK_URL } from 'src/config'
import { AppBar, type AppBarSize } from '@soroush.tech/design-system/AppBar'
import { Card } from '@soroush.tech/design-system/Card'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Icon } from '@soroush.tech/design-system/Icon'
import { Typography } from '@soroush.tech/design-system/Typography'
import { View } from '@soroush.tech/design-system/View'
import { CardTitle } from './CardTitle'

const SIZES: AppBarSize[] = ['sm', 'md', 'lg']

export function AppBarCard() {
  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex={1}
      variant="bracketBox"
      title={
        <CardTitle
          title="APP_BAR"
          storybookHref={`${STORYBOOK_URL}?path=/docs/theme-appbar--docs`}
        />
      }
      caption="A top-level header container with a theme elevation shadow. size presets the padding; blur applies a frosted-glass backdrop filter."
    >
      <Flex flexDirection="column" gap={4}>
        {SIZES.map((size) => (
          <View key={size}>
            <Typography
              variant="caption"
              color="secondary"
              opacity={0.5}
              display="block"
              mb={1}
              fontFamily="mono"
            >
              SIZE_{size.toUpperCase()}
            </Typography>
            <AppBar size={size} color="terminal" elevation={4}>
              <Flex
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                width="100%"
              >
                <Typography variant="caption" color="primary" fontFamily="mono">
                  SOROUSH.TECH
                </Typography>
                <Icon name="menu" color="primary" size={16} />
              </Flex>
            </AppBar>
          </View>
        ))}
      </Flex>
    </Card>
  )
}
