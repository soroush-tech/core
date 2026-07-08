import { useState } from 'react'
import { STORYBOOK_URL } from 'src/config'
import { Button } from 'src/theme/Button'
import { ButtonGroup, type ButtonGroupProps } from 'src/theme/ButtonGroup'
import { Card } from 'src/theme/Card'
import { Flex } from 'src/theme/Flex'
import { ToggleButton, ToggleButtonGroup, type ToggleButtonValue } from 'src/theme/ToggleButton'
import { Typography } from 'src/theme/Typography'
import { View } from 'src/theme/View'
import { CardTitle } from './CardTitle'

const VARIANTS: NonNullable<ButtonGroupProps['variant']>[] = ['contained', 'outlined', 'text']
const VIEW_MODES: ToggleButtonValue[] = ['grid', 'list', 'table']

export function ButtonGroupCard() {
  const [viewMode, setViewMode] = useState<ToggleButtonValue | null>('grid')

  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex={1}
      variant="bracketBox"
      title={
        <CardTitle
          title="BUTTON_GROUP"
          storybookHref={`${STORYBOOK_URL}?path=/docs/theme-buttongroup--docs`}
        />
      }
      caption="ButtonGroup joins Button children into one cluster and broadcasts variant/color/size via context. ToggleButtonGroup adds selection state — exclusive here, so re-clicking clears it."
    >
      <Flex flexDirection="column" gap={4}>
        {VARIANTS.map((variant) => (
          <View key={variant}>
            <Typography
              variant="caption"
              color="secondary"
              opacity={0.5}
              display="block"
              mb={1}
              fontFamily="mono"
            >
              VARIANT_{variant.toUpperCase()}
            </Typography>
            <ButtonGroup variant={variant} color="primary" aria-label={`${variant} button group`}>
              <Button>ONE</Button>
              <Button>TWO</Button>
              <Button>THREE</Button>
            </ButtonGroup>
          </View>
        ))}
        <View>
          <Typography
            variant="caption"
            color="secondary"
            opacity={0.5}
            display="block"
            mb={1}
            fontFamily="mono"
          >
            TOGGLE_EXCLUSIVE
          </Typography>
          <ToggleButtonGroup
            isExclusive
            value={viewMode}
            onChange={(value) => setViewMode(value as ToggleButtonValue | null)}
            color="primary"
            aria-label="view mode"
          >
            {VIEW_MODES.map((mode) => (
              <ToggleButton key={mode} value={mode}>
                {String(mode).toUpperCase()}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <Typography variant="caption" color="secondary" display="block" mt={2} fontFamily="mono">
            VIEW_MODE={String(viewMode ?? 'none').toUpperCase()}
          </Typography>
        </View>
      </Flex>
    </Card>
  )
}
