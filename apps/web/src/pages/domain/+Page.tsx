import { keyframes } from '@emotion/react'
import styled from '@emotion/styled'
import { Layout } from 'src/common/Layout'
import { Grid as BentoGrid } from '@soroush.tech/design-system/Grid'
import { View } from '@soroush.tech/design-system/View'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Typography } from '@soroush.tech/design-system/Typography'
import { DomainCard } from 'src/common/DomainCard'
import { domains } from './domain.data'

const pulseAnim = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
`

// Custom CSS: clamp() for fluid font scaling cannot be expressed as a
// Typography variant; text-shadow glow has no theme primitive equivalent.
const HeroTitle = styled(Typography, { label: 'HeroTitle' })`
  font-size: clamp(3rem, 6vw, 6rem);
  line-height: 1;
  text-transform: uppercase;
`

const AccentSpan = styled('span', { label: 'AccentSpan' })`
  color: ${({ theme }) => theme.text.primary};
  text-shadow: 0 0 10px ${({ theme }) => theme.text.primary}80;
`

const PulseDot = styled(View, { label: 'PulseDot' })`
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  background-color: ${({ theme }) => theme.text.primary};
  animation: ${pulseAnim} 2s ease-in-out infinite;
`

export default function DomainPage() {
  return (
    <Layout blueprintProps={{ scanline: true }}>
      <View maxWidth="1280px" mx="auto" px={4} pt={6} pb={8}>
        <View mb={8}>
          <Flex flexDirection="row" alignItems="center" gap={1} mb={2}>
            <PulseDot />
            <Typography variant="overline" color="secondary">
              DELIVERY STATUS: OPERATIONAL
            </Typography>
          </Flex>
          <Flex
            flexDirection={['column', 'column', 'row']}
            justifyContent="space-between"
            alignItems={['flex-start', 'flex-start', 'flex-end']}
            gap={4}
          >
            <HeroTitle as="h1" color="initial" letterSpacing="tighter">
              DELIVERY&nbsp;
              <AccentSpan>DOMAINS</AccentSpan>
            </HeroTitle>
            <Typography
              variant="body1"
              color="secondary"
              fontStyle="italic"
              lineHeight="relaxed"
              maxWidth="32rem"
              m={0}
            >
              &ldquo; From data model to deployment, frontend to infrastructure, AI to sub-second
              performance — the domains where complex systems get architected, scaled, and shipped
              under load.&ldquo;
            </Typography>
          </Flex>
        </View>

        <View borderWidth="thin" borderStyle="solid" borderColor="light">
          <BentoGrid gridTemplateColumns="repeat(auto-fill, minmax(320px, 1fr))">
            {domains.map((domain) => (
              <DomainCard
                key={domain.index}
                {...domain}
                style={domain.featured ? { gridColumn: '1 / -1' } : undefined}
              />
            ))}
          </BentoGrid>
        </View>
      </View>
    </Layout>
  )
}
