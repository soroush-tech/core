import { useEffect, useState } from 'react'
import { STORYBOOK_URL } from 'src/config'
import { Card } from '@soroush.tech/design-system/Card'
import {
  CircularProgress,
  type CircularProgressEasing,
} from '@soroush.tech/design-system/CircularProgress'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Typography } from '@soroush.tech/design-system/Typography'
import { View } from '@soroush.tech/design-system/View'
import { CardTitle } from './CardTitle'

const EASINGS: CircularProgressEasing[] = ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out']

export function CircularProgressCard() {
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

  return (
    <Card
      elevation={0}
      bg="paper"
      flex={1}
      p={5}
      variant="bracketBox"
      title={
        <CardTitle
          title="CIRCULAR_PROGRESS"
          storybookHref={`${STORYBOOK_URL}?path=/docs/theme-circularprogress--docs`}
        />
      }
      caption="Indeterminate loops continuously with configurable easing. Determinate is value-driven (0–100) on a 10s loop."
    >
      <Flex flexDirection="column" gap={5}>
        <Flex flexDirection="row" alignItems="flex-end" gap={2} flexWrap="wrap">
          <View textAlign="center">
            <CircularProgress color="primary" size="48px" mb={2} />
            <Typography
              variant="caption"
              color="secondary"
              opacity={0.5}
              display="block"
              fontFamily="mono"
            >
              default
            </Typography>
          </View>
          {EASINGS.map((easing) => (
            <View key={easing} textAlign="center">
              <CircularProgress color="primary" showTrack size="48px" easing={easing} mb={2} />
              <Typography
                variant="caption"
                color="secondary"
                opacity={0.5}
                display="block"
                fontFamily="mono"
              >
                {easing}
              </Typography>
            </View>
          ))}
        </Flex>

        <Flex flexDirection="row" alignItems="flex-end" gap={2} flexWrap="wrap">
          <View textAlign="center">
            <CircularProgress
              variant="determinate"
              showTrack
              value={value}
              color="primary"
              size="48px"
              mb={2}
            />
            <Typography
              variant="caption"
              color="secondary"
              opacity={0.5}
              display="block"
              fontFamily="mono"
            >
              {value}%
            </Typography>
          </View>
          {EASINGS.map((easing) => (
            <View key={easing} textAlign="center">
              <CircularProgress
                showTrack
                value={value}
                spinning
                variant="determinate"
                disableShrink
                color="primary"
                size="48px"
                easing={easing}
                mb={2}
              />
              <Typography
                variant="caption"
                color="secondary"
                opacity={0.5}
                display="block"
                fontFamily="mono"
              >
                {easing}
              </Typography>
            </View>
          ))}
        </Flex>
      </Flex>
    </Card>
  )
}
