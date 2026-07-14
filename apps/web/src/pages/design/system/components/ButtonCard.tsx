import { STORYBOOK_URL } from 'src/config'
import { Card } from '@soroush.tech/design-system/Card'
import { Button } from '@soroush.tech/design-system/Button'
import { Flex } from '@soroush.tech/design-system/Flex'
import { CardTitle } from './CardTitle'

export function ButtonCard() {
  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex="1"
      variant="bracketBox"
      title={
        <CardTitle
          title="BUTTON"
          storybookHref={`${STORYBOOK_URL}?path=/docs/theme-button--docs`}
        />
      }
      caption="Sharp, uppercase, bold. Three visual variants (contained, outlined, text), six semantic palettes, and three sizes."
    >
      <Flex flexDirection="column" gap={3}>
        <Flex flexDirection="row" alignItems="center" gap={3} flexWrap="wrap">
          <Button variant="contained" color="primary" size="lg">
            SOLID_LG
          </Button>
          <Button variant="contained" color="primary" size="md">
            SOLID_MD
          </Button>
          <Button variant="contained" color="primary" size="sm">
            SM
          </Button>
        </Flex>
        <Flex flexDirection="row" alignItems="center" gap={3} flexWrap="wrap">
          <Button variant="outlined" color="primary" size="lg">
            OUTLINE_LG
          </Button>
          <Button variant="outlined" color="primary" size="md">
            MD
          </Button>
          <Button variant="outlined" color="primary" size="sm">
            SM
          </Button>
        </Flex>
        <Flex flexDirection="row" alignItems="center" gap={3} flexWrap="wrap">
          <Button variant="text" color="primary" size="lg">
            TEXT_LG
          </Button>
          <Button variant="text" color="primary" size="md">
            MD
          </Button>
          <Button variant="text" color="primary" size="sm">
            SM
          </Button>
        </Flex>
      </Flex>
    </Card>
  )
}
