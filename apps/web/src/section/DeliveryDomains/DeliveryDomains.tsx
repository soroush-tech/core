import { View } from '@soroush.tech/design-system/View'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Grid } from '@soroush.tech/design-system/Grid'
import { Typography } from '@soroush.tech/design-system/Typography'
import { Link } from '@soroush.tech/design-system/Link'
import { Icon } from '@soroush.tech/design-system/Icon'
import { IconCard } from 'src/common/IconCard'
import { Eyebrow } from 'src/common/Eyebrow'
import { domains } from './DeliveryDomains.data'

export function DeliveryDomains() {
  return (
    <View as="section" py={6}>
      <Grid layout gap={1}>
        <Flex
          span="full"
          flexDirection={['column', 'row']}
          justifyContent="space-between"
          alignItems={['flex-start', 'flex-end']}
          gap={6}
          mb={7}
        >
          <View maxWidth="42rem">
            <Eyebrow>
              <Typography
                variant="h2"
                color="initial"
                fontWeight="bold"
                letterSpacing="tight"
                mb={2}
              >
                Delivery Domains
              </Typography>
            </Eyebrow>
            <Typography variant="body1" color="secondary" fontStyle="italic" m={0}>
              &ldquo;Optimized delivery across all modern compute surfaces.&rdquo;
            </Typography>
          </View>

          <Link
            href="/domain/"
            variant="button"
            color="primary"
            underline="hover"
            fontFamily="mono"
            letterSpacing="wide"
            display="inline-flex"
            alignItems="center"
            gap={1}
            flexShrink={0}
          >
            ALL_DOMAINS
            <Icon name="external_link" color="inherit" size="1em" />
          </Link>
        </Flex>

        {domains.map(({ icon, title, body, stack }) => (
          <IconCard
            key={title}
            icon={icon}
            title={title}
            body={body}
            span={{ xs: 4, sm: 8, md: 4 }}
          >
            <Typography
              variant="caption"
              color="secondary"
              letterSpacing="tight"
              textTransform="uppercase"
              m={0}
            >
              {stack}
            </Typography>
          </IconCard>
        ))}
      </Grid>
    </View>
  )
}
