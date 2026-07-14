import { STORYBOOK_URL } from 'src/config'
import { Card } from '@soroush.tech/design-system/Card'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Typography } from '@soroush.tech/design-system/Typography'
import { CardTitle } from './CardTitle'

export function FlexCard() {
  return (
    <Card
      bg="paper"
      p={5}
      flex="1"
      variant="bracketBox"
      title={
        <CardTitle
          title="VIEW / FLEX"
          storybookHref={`${STORYBOOK_URL}?path=/docs/theme-flex--docs`}
        />
      }
      caption="View is the base layout primitive — a div with all styled-system props. Flex extends it with display:flex and column direction by default."
    >
      <Flex flexDirection="column" gap={3}>
        <Flex flexDirection="row" gap={2}>
          {[1, 2, 3].map((n) => (
            <Flex
              key={n}
              flex="1"
              bg="default"
              p={3}
              borderWidth="thin"
              borderStyle="solid"
              borderColor="primary"
            >
              <Typography variant="caption" color="secondary" fontFamily="mono" opacity={0.5}>
                CELL_{n}
              </Typography>
            </Flex>
          ))}
        </Flex>
        <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="secondary" fontFamily="mono">
            FLEX_ROW / JUSTIFY_BETWEEN
          </Typography>
          <Typography variant="caption" color="primary" fontFamily="mono">
            VALID
          </Typography>
        </Flex>
      </Flex>
    </Card>
  )
}
