import { STORYBOOK_URL } from 'src/config'
import { Card } from '@soroush.tech/design-system/Card'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Typography } from '@soroush.tech/design-system/Typography'
import { CardTitle } from './CardTitle'

export function TypographyCard() {
  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex="1"
      variant="bracketBox"
      title={
        <CardTitle
          title="TYPOGRAPHY"
          storybookHref={`${STORYBOOK_URL}?path=/docs/theme-typography--docs`}
        />
      }
      caption="The variant prop controls both the HTML element and the visual scale."
    >
      <Flex flexDirection="column" gap={2}>
        {(
          [
            ['h1', 'Heading 1'],
            ['h2', 'Heading 2'],
            ['h3', 'Heading 3'],
            ['h4', 'Heading 4'],
            ['h5', 'Heading 5'],
            ['h6', 'Heading 6'],
            ['body1', 'Body 1'],
            ['body2', 'Body 2'],
            ['caption', 'Caption'],
            ['overline', 'overline'],
          ] as const
        ).map(([variant, label]) => (
          <Flex key={variant} flexDirection="row" alignItems="baseline" gap={3}>
            <Typography
              variant="caption"
              color="secondary"
              fontFamily="mono"
              opacity={0.5}
              width="4rem"
              flexShrink={0}
              m={0}
            >
              {variant}
            </Typography>
            <Typography variant={variant} color="initial" m={0}>
              {label}
            </Typography>
          </Flex>
        ))}
      </Flex>
    </Card>
  )
}
