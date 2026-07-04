import { styled } from 'src/theme'
import { Flex } from 'src/theme/Flex'
import { View } from 'src/theme/View'
import { Typography } from 'src/theme/Typography'
import { Button } from 'src/theme/Button'

// font-size: 15vw is a viewport unit with no theme token;
const DecorativeText = styled(Typography, { label: 'DecorativeText' })`
  font-size: 15vw;
  pointer-events: none;
  user-select: none;
`

export function CallToAction() {
  return (
    <View as="section" position="relative" overflow="hidden" py={10} px={4}>
      <Flex
        position="absolute"
        top={0}
        right={0}
        bottom={0}
        left={0}
        alignItems="center"
        justifyContent="center"
        aria-hidden="true"
        opacity={0.05}
        style={{ pointerEvents: 'none' }}
      >
        <DecorativeText as="span" variant="inherit" fontWeight="black" color="initial">
          ARCHITECT
        </DecorativeText>
      </Flex>

      <View maxWidth="896px" mx="auto" textAlign="center" position="relative" zIndex={1}>
        <Flex alignItems="center" gap={5}>
          <Typography
            variant="h1"
            as="h2"
            color="initial"
            letterSpacing="tighter"
            lineHeight="tight"
          >
            Let&apos;s Build <br /> Something{' '}
            <Typography as="span" color="primary" variant="inherit">
              Great.
            </Typography>
          </Typography>
          <Typography variant="body1" color="secondary" maxWidth="672px" mx="auto">
            Currently accepting high-impact development consulting and senior leadership
            opportunities.
          </Typography>
          <Flex flexDirection={['column', 'row']} gap={3} justifyContent="center">
            <Button
              href="/contact/"
              variant="contained"
              color="primary"
              size="lg"
              letterSpacing="widest"
            >
              Contact Now
            </Button>
          </Flex>
        </Flex>
      </View>
    </View>
  )
}
