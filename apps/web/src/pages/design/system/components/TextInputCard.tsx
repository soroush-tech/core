import { STORYBOOK_URL } from 'src/config'
import { Card } from '@soroush.tech/design-system/Card'
import { Flex } from '@soroush.tech/design-system/Flex'
import { TextInput } from '@soroush.tech/design-system/TextInput'
import { Typography } from '@soroush.tech/design-system/Typography'
import { View } from '@soroush.tech/design-system/View'
import { CardTitle } from './CardTitle'

export function TextInputCard() {
  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex="1"
      variant="bracketBox"
      title={
        <CardTitle
          title="TEXT_INPUT"
          storybookHref={`${STORYBOOK_URL}?path=/docs/theme-textinput--docs`}
        />
      }
      caption="Theme-aware text input. Supports controlled and uncontrolled usage, multiline, error state, and disabled state."
    >
      <Flex flexDirection="column" gap={4}>
        <View>
          <Typography
            variant="caption"
            letterSpacing="widest"
            color="secondary"
            display="block"
            mb={2}
            fontFamily="mono"
          >
            ACCESS_KEY_PRIMARY
          </Typography>
          <TextInput placeholder="ENTER_HASH..." variant="underline" color="primary" fullWidth />
        </View>

        <View>
          <Typography
            variant="caption"
            letterSpacing="widest"
            color="error"
            display="block"
            mb={2}
            fontFamily="mono"
          >
            SYSTEM_ERROR_CODE
          </Typography>
          <TextInput value="0x882_FAILURE" variant="underline" color="error" error fullWidth />
          <Typography variant="caption" display="block" mt={1} fontFamily="mono" color="error">
            CRITICAL: CONNECTION_TIMEOUT
          </Typography>
        </View>
      </Flex>
    </Card>
  )
}
