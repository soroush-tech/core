import { DESIGN_SYSTEM_DOCS_URL } from 'src/pages/design/system/const'
import { Alert, AlertTitle } from '@soroush.tech/design-system/Alert'
import { Card } from '@soroush.tech/design-system/Card'
import { Flex } from '@soroush.tech/design-system/Flex'
import { CardTitle } from './CardTitle'
import { ALERTS } from './AlertCard.data'

export function AlertCard() {
  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex={1}
      variant="bracketBox"
      title={<CardTitle title="ALERT" docsHref={`${DESIGN_SYSTEM_DOCS_URL}/components/alert/`} />}
      caption="An inline message whose severity picks the icon and palette. A role of status announces it politely; an AlertTitle can lead the message."
    >
      <Flex gap={3}>
        {ALERTS.map(({ severity, title, message }) => (
          <Alert key={severity} severity={severity} role="status">
            {title !== undefined && <AlertTitle>{title}</AlertTitle>}
            {message}
          </Alert>
        ))}
      </Flex>
    </Card>
  )
}
