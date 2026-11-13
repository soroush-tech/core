import { Card } from '@soroush.tech/design-system/Card'
import { Flex } from '@soroush.tech/design-system/Flex'
import { FontStyle } from 'src/common/FontStyle'
import { CardTitle } from './CardTitle'

export function FontCard() {
  return (
    <Card variant="bracketBox" bg="paper" p={5} title={<CardTitle title="FONT_SYSTEM" />}>
      <Flex flexDirection="row" gap={3}>
        <FontStyle variant="body" />
        <FontStyle variant="mono" />
      </Flex>
    </Card>
  )
}
