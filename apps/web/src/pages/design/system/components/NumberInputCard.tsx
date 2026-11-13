import { useState } from 'react'
import { DESIGN_SYSTEM_DOCS_URL } from 'src/pages/design/system/const'
import { Card } from '@soroush.tech/design-system/Card'
import { Flex } from '@soroush.tech/design-system/Flex'
import { NumberInput } from '@soroush.tech/design-system/NumberInput'
import { Typography } from '@soroush.tech/design-system/Typography'
import { CardTitle } from './CardTitle'

export function NumberInputCard() {
  const [replicas, setReplicas] = useState<number | null>(3)
  const [load, setLoad] = useState<number | null>(0.5)

  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex={1}
      variant="bracketBox"
      title={
        <CardTitle
          title="NUMBER_INPUT"
          docsHref={`${DESIGN_SYSTEM_DOCS_URL}/components/number-input/`}
        />
      }
      caption="A spinbutton that reads and writes the number in its locale, clamps it to min/max, and steps by the arrow keys, Home/End and held buttons."
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
            STACKED · 1-10
          </Typography>
          <NumberInput
            aria-label="Replicas"
            variant="outlined"
            value={replicas}
            onChange={setReplicas}
            min={1}
            max={10}
            incrementLabel="Increase replicas"
            decrementLabel="Decrease replicas"
            fullWidth
          />
          <Typography variant="caption" color="secondary" fontFamily="mono" mt={2}>
            REPLICAS: {replicas ?? 'NONE'}
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
            SIDES · PERCENT
          </Typography>
          <NumberInput
            aria-label="Load"
            variant="outlined"
            spinButtons="sides"
            value={load}
            onChange={setLoad}
            min={0}
            max={1}
            step={0.1}
            format={{ style: 'percent' }}
            incrementLabel="Increase load"
            decrementLabel="Decrease load"
            fullWidth
          />
          <Typography variant="caption" color="secondary" fontFamily="mono" mt={2}>
            RAW_VALUE: {load ?? 'NONE'}
          </Typography>
        </Flex>
      </Flex>
    </Card>
  )
}
