import { DESIGN_SYSTEM_DOCS_URL } from 'src/pages/design/system/const'
import { Card } from '@soroush.tech/design-system/Card'
import { Flex } from '@soroush.tech/design-system/Flex'
import { ScrollArea } from '@soroush.tech/design-system/ScrollArea'
import { Typography } from '@soroush.tech/design-system/Typography'
import { View } from '@soroush.tech/design-system/View'
import { CardTitle } from './CardTitle'

const LOG_LINES = Array.from(
  { length: 16 },
  (_, index) => `[${String(index + 1).padStart(2, '0')}] BUILD_STEP_${index + 1} ... OK`
)

export function ScrollAreaCard() {
  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex={1}
      variant="bracketBox"
      title={
        <CardTitle
          title="SCROLL_AREA"
          docsHref={`${DESIGN_SYSTEM_DOCS_URL}/components/scroll-area/`}
        />
      }
      caption="Native scrolling with an overlay scrollbar drawn over the content, shown only on hover or focus - so a rounded panel keeps its corners clean."
    >
      <View bg="terminal" borderRadius="md">
        <ScrollArea maxHeight="10rem" aria-label="Build log" tabIndex={0} p={3}>
          <Flex flexDirection="column" gap={1}>
            {LOG_LINES.map((line) => (
              <Typography key={line} variant="caption" color="secondary" fontFamily="mono">
                {line}
              </Typography>
            ))}
          </Flex>
        </ScrollArea>
      </View>
    </Card>
  )
}
