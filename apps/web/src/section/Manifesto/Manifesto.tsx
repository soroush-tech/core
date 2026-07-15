import { styled } from '@soroush.tech/design-system'
import { View } from '@soroush.tech/design-system/View'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Typography } from '@soroush.tech/design-system/Typography'
import { beliefs } from './Manifesto.data'

// palette.primary.main / contrastText are not in the background / text scales, so the
// neon panel and its on-primary text colour are applied via styled (Eyebrow precedent).
const GreenPanel = styled(Flex, { label: 'GreenPanel' })`
  background-color: ${({ theme }) => theme.palette.primary.main};
  color: ${({ theme }) => theme.palette.primary.contrastText};
`

// inherits the panel's on-primary colour via currentColor
const OnPrimaryBar = styled(View, { label: 'OnPrimaryBar' })`
  background-color: currentColor;
`

export function Manifesto() {
  return (
    <View as="section" bg="primary" py={10} px={4}>
      <Flex
        flexDirection={['column', 'row']}
        alignItems="center"
        gap={8}
        maxWidth="1280px"
        mx="auto"
      >
        <GreenPanel flex={1} width="100%" py={4} px={6} position="relative" overflow="hidden">
          <Flex gap={5}>
            <Typography
              variant="h2"
              color="inherit"
              fontWeight="black"
              fontStyle="italic"
              letterSpacing="tighter"
              lineHeight="none"
              m={0}
            >
              SELF TAUGHT
              <br />
              MANIFESTO
            </Typography>
            <OnPrimaryBar height="0.25rem" width="5rem" />
            <Typography
              variant="body1"
              fontSize={3}
              color="inherit"
              fontWeight="bold"
              lineHeight="tight"
              m={0}
            >
              &ldquo;The horizon of knowledge is a boundary created only by one&rsquo;s own
              curiosity. In a system without limits, the only error is stopping the crawl.&rdquo;
            </Typography>
          </Flex>
        </GreenPanel>

        <Flex flex={1} width="100%" gap={6}>
          <Flex gap={4}>
            {beliefs.map(({ label, labelColor, body }) => (
              <View key={label} bg="paper" p={4}>
                <Typography
                  variant="overline"
                  as="h3"
                  color={labelColor}
                  letterSpacing="widest"
                  fontWeight="bold"
                  textTransform="uppercase"
                  mb={2}
                >
                  {label}
                </Typography>
                <Typography variant="body2" color="secondary" m={0}>
                  {body}
                </Typography>
              </View>
            ))}
          </Flex>
        </Flex>
      </Flex>
    </View>
  )
}
