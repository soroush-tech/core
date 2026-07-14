import { Flex } from '@soroush.tech/design-system/Flex'
import { Icon } from '@soroush.tech/design-system/Icon'
import { Link } from '@soroush.tech/design-system/Link'
import { Typography } from '@soroush.tech/design-system/Typography'
import { View } from '@soroush.tech/design-system/View'

export interface CardTitleProps {
  title: string
  storybookHref?: string
}

export function CardTitle({ title, storybookHref }: Readonly<CardTitleProps>) {
  return (
    <View mb={1}>
      <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
        <Typography variant="overline" color="primary" fontFamily="mono" m={0}>
          {title}
        </Typography>
        {storybookHref !== undefined && (
          <Link
            href={storybookHref}
            target="_blank"
            variant="caption"
            underline="hover"
            fontFamily="mono"
            display="inline-flex"
            alignItems="center"
            gap={1}
          >
            STORYBOOK
            <Icon name="external_link" color="inherit" size={12} />
          </Link>
        )}
      </Flex>
    </View>
  )
}
