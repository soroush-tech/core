import { useState } from 'react'
import { DESIGN_SYSTEM_DOCS_URL } from 'src/pages/design/system/const'
import { Card } from '@soroush.tech/design-system/Card'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Icon, type IconName } from '@soroush.tech/design-system/Icon'
import {
  ToggleButton,
  ToggleButtonGroup,
  type ToggleButtonValue,
} from '@soroush.tech/design-system/ToggleButton'
import { Typography } from '@soroush.tech/design-system/Typography'
import { View } from '@soroush.tech/design-system/View'
import { CardTitle } from './CardTitle'

const LAYOUTS: { value: string; icon: IconName; label: string }[] = [
  { value: 'grid', icon: 'grid_view', label: 'Grid layout' },
  { value: 'list', icon: 'format_list_bulleted', label: 'List layout' },
  { value: 'table', icon: 'table', label: 'Table layout' },
]

export function ToggleButtonCard() {
  const [layout, setLayout] = useState<ToggleButtonValue>('grid')
  const [isStarred, setIsStarred] = useState(false)

  // Exclusive, but never empty: re-clicking the active option keeps it selected.
  const handleLayoutChange = (next: ToggleButtonValue | ToggleButtonValue[] | null) => {
    if (next !== null && !Array.isArray(next)) setLayout(next)
  }

  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex={1}
      variant="bracketBox"
      title={
        <CardTitle
          title="TOGGLE_BUTTON"
          docsHref={`${DESIGN_SYSTEM_DOCS_URL}/components/toggle-button/`}
        />
      }
      caption="A button that holds a pressed state, alone or in an exclusive group. Icon-only toggles carry an aria-label; state is exposed through aria-pressed."
    >
      <Flex flexDirection={['column', 'row']} gap={5}>
        <View>
          <Typography
            variant="caption"
            color="secondary"
            opacity={0.5}
            display="block"
            mb={1}
            fontFamily="mono"
          >
            EXCLUSIVE_REQUIRED
          </Typography>
          <ToggleButtonGroup
            isExclusive
            value={layout}
            onChange={handleLayoutChange}
            color="primary"
            aria-label="Layout"
          >
            {LAYOUTS.map((option) => (
              <ToggleButton key={option.value} value={option.value} aria-label={option.label}>
                <Icon name={option.icon} color="inherit" size="sm" />
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </View>
        <View>
          <Typography
            variant="caption"
            color="secondary"
            opacity={0.5}
            display="block"
            mb={1}
            fontFamily="mono"
          >
            STANDALONE
          </Typography>
          <ToggleButton
            value="star"
            color="primary"
            isSelected={isStarred}
            onChange={() => setIsStarred(!isStarred)}
            aria-label="Star"
          >
            <Icon name={isStarred ? 'star' : 'star_border'} color="inherit" size="sm" />
          </ToggleButton>
        </View>
      </Flex>
    </Card>
  )
}
