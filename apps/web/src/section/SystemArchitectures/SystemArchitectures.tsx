import { styled } from '@soroush.tech/design-system'
import { View } from '@soroush.tech/design-system/View'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Grid } from '@soroush.tech/design-system/Grid'
import { Typography } from '@soroush.tech/design-system/Typography'
import { Image } from '@soroush.tech/design-system/Image'
import { Icon } from '@soroush.tech/design-system/Icon'
import dataCenter from 'src/assets/datacenter-server-room.png?w=256;384;512&format=avif;webp;png&as=picture'
import { ThemeProvider } from '@soroush.tech/design-system/ThemeProvider'
import { dark } from '@soroush.tech/design-system/themes'

// Cover-fill bento tile — ~792px tall once the grid goes multi-column at the 52em (832px)
// breakpoint (square source binds to the taller side); full viewport width below that.
const DATA_CENTER_SIZES = '(min-width: 832px) 792px, 100vw'

// palette.primary.main / contrastText are not in the background / text scales, so the
// neon badge is applied via styled (same documented exception as Eyebrow).
const GreenBadge = styled(Typography, { label: 'GreenBadge' })`
  background-color: ${({ theme }) => theme.palette.primary.main};
  color: ${({ theme }) => theme.palette.primary.contrastText};
`

const cloudNative = [
  'Continuous deployment',
  ' zero-downtime',
  'automated scaling',
  'Kubernetes orchestration',
  'rapid deployment',
]
const security = [
  'Identity-based security',
  'OAuth authentication',
  'Encrypted transit protocols',
  'Isolated private zones',
]

export function SystemArchitectures() {
  return (
    <View as="section" py={10} px={4}>
      <View maxWidth="1280px" mx="auto">
        <Grid
          gridTemplateColumns={['1fr', '1fr', 'repeat(4, 1fr)']}
          gridTemplateRows={['auto', 'auto', 'repeat(2, 1fr)']}
          gap={2}
          height={['auto', 'auto', '800px']}
        >
          {/* Tile 1 — Global Data Mesh (image) */}
          <Grid
            gridColumn={['auto', 'auto', 'span 2']}
            gridRow={['auto', 'auto', 'span 2']}
            position="relative"
            overflow="hidden"
            bg="default"
            minHeight={['400px', '400px', 'auto']}
          >
            <picture>
              {Object.entries(dataCenter.sources).map(([format, srcSet]) => (
                <source
                  key={format}
                  srcSet={srcSet}
                  type={`image/${format}`}
                  sizes={DATA_CENTER_SIZES}
                />
              ))}
              <Image
                src={dataCenter.img.src}
                sizes={DATA_CENTER_SIZES}
                alt="Distributed architecture orchestrating"
                fetchPriority="high"
                top={0}
                left={0}
                width="100%"
                height="100%"
                objectFit="cover"
              />
            </picture>
            <View position="absolute" top={0} left={0} width="100%" height="100%" bg="backdrop" />
            <View position="absolute" bottom={0} left={0} p={4}>
              <GreenBadge
                variant="caption"
                as="span"
                display="inline-block"
                px={3}
                py={1}
                mb={4}
                fontWeight="bold"
                letterSpacing="wider"
                textTransform="uppercase"
              >
                Enterprise
              </GreenBadge>
              <ThemeProvider theme={dark}>
                <Typography
                  variant="h3"
                  color="initial"
                  fontWeight="bold"
                  textTransform="uppercase"
                  mb={2}
                >
                  Global Zone Network
                </Typography>
                <Typography variant="body2" color="secondary" maxWidth="24rem" m={0}>
                  Distributed architecture orchestrating real-time edge computing and Big Data
                  across 14 global zones.
                </Typography>
              </ThemeProvider>
            </View>
          </Grid>

          {/* Tile 2 — Event-Driven Core */}
          <Grid gridColumn={['auto', 'auto', 'span 2']} bg="default">
            <Flex justifyContent="space-between" p={4} gap={6}>
              <View>
                <Icon name="hub" color="primary" size="2.25rem" />
                <Typography
                  variant="h3"
                  as="h3"
                  color="initial"
                  fontWeight="bold"
                  textTransform="uppercase"
                  mt={4}
                  mb={2}
                >
                  Event-Driven Core
                </Typography>
                <Typography variant="body2" color="secondary" letterSpacing="wider" mb={2} as="p">
                  A reactive architecture built to absorb traffic peaks, offload heavy work into
                  queues, and orchestrate automated pipelines.
                </Typography>
                <Typography as="p" variant="body2" color="secondary" letterSpacing="wider">
                  This core serves as the central nervous system powering our entire ecosystem from
                  high-throughput microservices and real-time apps to responsive Electron desktop
                  applications, js extensions and web platforms
                </Typography>
              </View>
              <Flex flexDirection="row" justifyContent="flex-end">
                <View opacity={0.3} aria-hidden="true">
                  <Icon name="architecture" color="primary" size="3.5rem" />
                </View>
              </Flex>
            </Flex>
          </Grid>

          {/* Tile 3 — Cloud Native */}
          <Grid bg="paper">
            <View p={4}>
              <Typography
                variant="h5"
                as="h3"
                color="initial"
                fontWeight="bold"
                textTransform="uppercase"
                mb={4}
              >
                Cloud-Native Deployment
              </Typography>
              <Flex gap={1}>
                {cloudNative.map((tool) => (
                  <Flex key={tool} flexDirection="row" alignItems="center" gap={2}>
                    <View width="0.375rem" height="0.375rem" bg="grid" />
                    <Typography
                      variant="caption"
                      color="secondary"
                      letterSpacing="wider"
                      textTransform="uppercase"
                      m={0}
                    >
                      {tool}
                    </Typography>
                  </Flex>
                ))}
              </Flex>
            </View>
          </Grid>

          {/* Tile 4 — Zero Trust */}
          <Grid bg="paper" position="relative" overflow="hidden">
            <View position="absolute" right={0} bottom={0} opacity={0.1} aria-hidden="true">
              <Icon name="security" color="primary" size="6rem" />
            </View>
            <View p={4} position="relative" zIndex={1}>
              <Typography
                variant="h5"
                as="h3"
                color="initial"
                fontWeight="bold"
                textTransform="uppercase"
                mb={4}
              >
                Zero Trust
              </Typography>
              <Flex gap={1}>
                {security.map((tool) => (
                  <Flex key={tool} flexDirection="row" alignItems="center" gap={2}>
                    <View width="0.375rem" height="0.375rem" bg="grid" />
                    <Typography
                      variant="caption"
                      color="secondary"
                      letterSpacing="wider"
                      textTransform="uppercase"
                      m={0}
                    >
                      {tool}
                    </Typography>
                  </Flex>
                ))}
              </Flex>
            </View>
          </Grid>
        </Grid>
      </View>
    </View>
  )
}
