import { useState } from 'react'
import { DESIGN_SYSTEM_DOCS_URL } from 'src/pages/design/system/const'
import { Card } from '@soroush.tech/design-system/Card'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Icon } from '@soroush.tech/design-system/Icon'
import { Pressable } from '@soroush.tech/design-system/Pressable'
import { Typography } from '@soroush.tech/design-system/Typography'
import { CardTitle } from './CardTitle'

export function PressableCard() {
  const [presses, setPresses] = useState(0)
  const press = () => setPresses((count) => count + 1)

  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex={1}
      variant="bracketBox"
      title={
        <CardTitle title="PRESSABLE" docsHref={`${DESIGN_SYSTEM_DOCS_URL}/components/pressable/`} />
      }
      caption="An unstyled clickable surface: button semantics - Enter/Space, focus ring, disabled - with none of a button's looks. Feedback is press-only: a tint or a dim."
    >
      <Flex flexDirection={['column', 'row']} gap={3}>
        <Pressable feedback="highlight" p={3} borderRadius="md" onClick={press}>
          <Flex flexDirection="row" alignItems="center" gap={2}>
            <Icon name="terminal" color="primary" size={16} />
            <Typography variant="caption" fontFamily="mono" color="initial">
              HIGHLIGHT_ROW
            </Typography>
          </Flex>
        </Pressable>
        <Pressable feedback="opacity" activeOpacity={0.4} p={3} borderRadius="md" onClick={press}>
          <Flex flexDirection="row" alignItems="center" gap={2}>
            <Icon name="code" color="primary" size={16} />
            <Typography variant="caption" fontFamily="mono" color="initial">
              OPACITY_ROW
            </Typography>
          </Flex>
        </Pressable>
        <Pressable disabled p={3} borderRadius="md" onClick={press}>
          <Flex flexDirection="row" alignItems="center" gap={2}>
            <Icon name="lock" color="secondary" size={16} />
            <Typography variant="caption" fontFamily="mono" color="secondary">
              DISABLED_ROW
            </Typography>
          </Flex>
        </Pressable>
      </Flex>
      <Typography variant="caption" color="secondary" fontFamily="mono" mt={3}>
        PRESSES: {presses}
      </Typography>
    </Card>
  )
}
