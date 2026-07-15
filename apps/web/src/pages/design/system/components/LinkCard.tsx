import { STORYBOOK_URL } from 'src/config'
import { Card } from '@soroush.tech/design-system/Card'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Link } from '@soroush.tech/design-system/Link'
import { Typography } from '@soroush.tech/design-system/Typography'
import { CardTitle } from './CardTitle'

export function LinkCard() {
  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      width={['100%', '400px']}
      variant="bracketBox"
      title={
        <CardTitle title="LINK" storybookHref={`${STORYBOOK_URL}?path=/docs/theme-link--docs`} />
      }
      caption='Renders as an a tag and composes Typography. Auto-injects noopener noreferrer for "_blank".'
    >
      <Flex flexDirection="column" gap={4}>
        {(
          [
            ['always', 'Always underlined'],
            ['hover', 'Underline on hover'],
            ['none', 'No underline'],
          ] as const
        ).map(([underline, label]) => (
          <Flex key={underline} flexDirection="row" alignItems="center" gap={3}>
            <Typography
              variant="caption"
              color="secondary"
              fontFamily="mono"
              opacity={0.5}
              width="3.5rem"
              flexShrink={0}
              m={0}
            >
              {underline}
            </Typography>
            <Link href="#" underline={underline} variant="body2">
              {label}
            </Link>
          </Flex>
        ))}
      </Flex>
    </Card>
  )
}
