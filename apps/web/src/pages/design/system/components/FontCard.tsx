import { STORYBOOK_URL } from 'src/config'
import { Card } from '@soroush.tech/design-system/Card'
import { Flex } from '@soroush.tech/design-system/Flex'
import { FontStyle } from 'src/common/FontStyle'
import { CardTitle } from './CardTitle'

export function FontCard() {
  return (
    <Card
      variant="bracketBox"
      bg="paper"
      p={5}
      title={
        <CardTitle
          title="FONT_SYSTEM"
          storybookHref={`${STORYBOOK_URL}?path=/docs/common-fontstyle--docs`}
        />
      }
    >
      <Flex flexDirection="row" gap={3}>
        <FontStyle variant="body" />
        <FontStyle variant="mono" />
      </Flex>
    </Card>
  )
}
