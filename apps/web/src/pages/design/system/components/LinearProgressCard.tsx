import { useEffect, useState } from 'react'
import { STORYBOOK_URL } from 'src/config'
import { Card } from '@soroush.tech/design-system/Card'
import { Flex } from '@soroush.tech/design-system/Flex'
import {
  LinearProgress,
  type LinearProgressProps,
} from '@soroush.tech/design-system/LinearProgress'
import { Typography } from '@soroush.tech/design-system/Typography'
import { View } from '@soroush.tech/design-system/View'
import { CardTitle } from './CardTitle'

export function LinearProgressCard() {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const duration = 10000
    let start: number | null = null
    let raf: number

    const step = (timestamp: number) => {
      start ??= timestamp
      const elapsed = (timestamp - start) % duration
      setValue(Math.round((elapsed / duration) * 100))
      raf = requestAnimationFrame(step)
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [])

  const valueBuffer = Math.min(value + 20, 100)

  const demos: { key: string; label: string; props: LinearProgressProps }[] = [
    { key: 'indeterminate', label: 'INDETERMINATE', props: {} },
    { key: 'query', label: 'QUERY', props: { variant: 'query' } },
    {
      key: 'determinate',
      label: `DETERMINATE_${value}%`,
      props: { variant: 'determinate', value },
    },
    {
      key: 'buffer',
      label: `BUFFER_${value}/${valueBuffer}`,
      props: { variant: 'determinate', buffer: true, value, valueBuffer },
    },
    {
      key: 'round-thick-spin',
      label: 'ROUND_THICK_SPIN',
      props: {
        variant: 'determinate',
        value,
        spinning: true,
        round: true,
        thickness: 8,
      },
    },
  ]

  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex={1}
      variant="bracketBox"
      title={
        <CardTitle
          title="LINEAR_PROGRESS"
          storybookHref={`${STORYBOOK_URL}?path=/docs/theme-linearprogress--docs`}
        />
      }
      caption="The horizontal counterpart of CircularProgress. Value-driven rows follow a shared 10s loop; spinning sends the value segment travelling along the track, wrapping past the end."
    >
      <Flex flexDirection="column" gap={4}>
        {demos.map(({ key, label, props }) => (
          <View key={key}>
            <Typography
              variant="caption"
              color="secondary"
              opacity={0.5}
              display="block"
              mb={1}
              fontFamily="mono"
            >
              {label}
            </Typography>
            <LinearProgress aria-label={`${key} demo`} {...props} />
          </View>
        ))}
      </Flex>
    </Card>
  )
}
