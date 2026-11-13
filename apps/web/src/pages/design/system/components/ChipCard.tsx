import { useState } from 'react'
import { DESIGN_SYSTEM_DOCS_URL } from 'src/pages/design/system/const'
import { Button } from '@soroush.tech/design-system/Button'
import { Card } from '@soroush.tech/design-system/Card'
import { Chip } from '@soroush.tech/design-system/Chip'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Icon } from '@soroush.tech/design-system/Icon'
import { Typography } from '@soroush.tech/design-system/Typography'
import { View } from '@soroush.tech/design-system/View'
import { CardTitle } from './CardTitle'

const TAGS = ['REACT', 'TYPESCRIPT', 'VITE']

function DemoLabel({ children }: Readonly<{ children: string }>) {
  return (
    <Typography
      variant="caption"
      color="secondary"
      opacity={0.5}
      display="block"
      fontFamily="mono"
      mb={2}
    >
      {children}
    </Typography>
  )
}

export function ChipCard() {
  const [isSelected, setIsSelected] = useState(false)
  const [tags, setTags] = useState(TAGS)

  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex={1}
      variant="bracketBox"
      title={<CardTitle title="CHIP" docsHref={`${DESIGN_SYSTEM_DOCS_URL}/components/chip/`} />}
      caption="A compact tag. Given onClick it becomes one button; given onDelete it shows a named delete control and also deletes on Backspace and Delete."
    >
      <Flex flexDirection="column" gap={5}>
        <View>
          <DemoLabel>STATIC</DemoLabel>
          <Flex flexDirection="row" gap={2} flexWrap="wrap">
            <Chip label="DEFAULT" />
            <Chip label="PRIMARY" color="primary" />
            <Chip label="OUTLINED" variant="outlined" />
            <Chip label="CODE" icon={<Icon name="code" color="inherit" size="sm" />} />
          </Flex>
        </View>
        <View>
          <DemoLabel>CLICKABLE</DemoLabel>
          <Chip
            label={isSelected ? 'SELECTED' : 'SELECT_ME'}
            color={isSelected ? 'primary' : 'default'}
            variant={isSelected ? 'contained' : 'outlined'}
            onClick={() => setIsSelected((selected) => !selected)}
          />
        </View>
        <View>
          <DemoLabel>DELETABLE</DemoLabel>
          <Flex flexDirection="row" gap={2} flexWrap="wrap" alignItems="center">
            {tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                variant="outlined"
                onDelete={() => setTags((current) => current.filter((item) => item !== tag))}
                deleteLabel={`Remove ${tag}`}
              />
            ))}
            {tags.length === 0 && (
              <Button variant="text" color="primary" size="sm" onClick={() => setTags(TAGS)}>
                RESET_TAGS
              </Button>
            )}
          </Flex>
        </View>
      </Flex>
    </Card>
  )
}
