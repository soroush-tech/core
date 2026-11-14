import { useState } from 'react'
import { DESIGN_SYSTEM_DOCS_URL } from 'src/pages/design/system/const'
import { Card } from '@soroush.tech/design-system/Card'
import { Flex } from '@soroush.tech/design-system/Flex'
import { RangeInput } from '@soroush.tech/design-system/RangeInput'
import { Typography } from '@soroush.tech/design-system/Typography'
import { CardTitle } from './CardTitle'

const LATENCY_LABELS = ['Lowest latency', 'Highest latency']

export function RangeInputCard() {
  const [volume, setVolume] = useState(30)
  const [latency, setLatency] = useState([20, 70])

  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex={1}
      variant="bracketBox"
      title={
        <CardTitle
          title="RANGE_INPUT"
          docsHref={`${DESIGN_SYSTEM_DOCS_URL}/components/range-input/`}
        />
      }
      caption="One thumb for a value, or one per entry for a range. Each thumb is a hidden native range input, so keys, forms and assistive technology work as the platform's."
    >
      <Flex flexDirection={['column', 'row']} gap={5}>
        <Flex flex="1">
          <Typography
            variant="caption"
            color="secondary"
            opacity={0.5}
            display="block"
            mb={2}
            fontFamily="mono"
          >
            SINGLE_THUMB
          </Typography>
          <RangeInput
            aria-label="Volume"
            value={volume}
            onChange={(_event, value) => setVolume(value as number)}
          />
          <Typography variant="caption" color="secondary" fontFamily="mono" mt={2}>
            VOLUME: {volume}
          </Typography>
        </Flex>
        <Flex flex="1">
          <Typography
            variant="caption"
            color="secondary"
            opacity={0.5}
            display="block"
            mb={2}
            fontFamily="mono"
          >
            RANGE · MARKS
          </Typography>
          <RangeInput
            value={latency}
            onChange={(_event, value) => setLatency(value as number[])}
            getAriaLabel={(index) => LATENCY_LABELS[index]}
            step={10}
            marks
            valueLabel="auto"
          />
          <Typography variant="caption" color="secondary" fontFamily="mono" mt={2}>
            LATENCY_MS: {latency.join(' - ')}
          </Typography>
        </Flex>
      </Flex>
    </Card>
  )
}
