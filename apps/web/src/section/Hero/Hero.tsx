import { Flex } from '@soroush.tech/design-system/Flex'
import { Typography } from '@soroush.tech/design-system/Typography'
import { Button } from '@soroush.tech/design-system/Button'
import { Eyebrow } from 'src/common/Eyebrow'
import { PageHeader } from 'src/common/PageHeader'

export function Hero() {
  return (
    <PageHeader minHeight="620px">
      <Eyebrow mb={3}>Principal Software Engineer</Eyebrow>

      <Typography
        variant="h1"
        color="initial"
        letterSpacing="tighter"
        textTransform="uppercase"
        lineHeight="tight"
        mb={4}
        m={0}
      >
        Building{' '}
        <Typography as="span" color="primary" fontStyle="italic" variant="inherit">
          High&#8209;Performance
        </Typography>
        <br />
        Software
      </Typography>

      <Typography
        variant="body1"
        color="secondary"
        lineHeight="relaxed"
        fontWeight="light"
        maxWidth="672px"
        mb={6}
        m={0}
      >
        Engineering scalable, low-latency systems where precision meets innovation. Specialized in
        distributed cloud environments and resilient micro-services.
      </Typography>

      <Flex mt={2} flexDirection={['column', 'row']} gap={3}>
        <Button
          href="/contact/"
          variant="contained"
          color="primary"
          size="lg"
          letterSpacing="widest"
        >
          Inquire
        </Button>
      </Flex>
    </PageHeader>
  )
}
