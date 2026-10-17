import { View } from '@soroush.tech/design-system/View'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Typography } from '@soroush.tech/design-system/Typography'
import { Image } from '@soroush.tech/design-system/Image'
import circuit from 'src/assets/methodology-circuit.png?w=256;384;512&format=avif;webp;png&as=picture'
import { Eyebrow } from 'src/common/Eyebrow'
import { steps } from './Methodology.data'

// Square slot is ~half the 1280px row (≈616px) once the halves sit side by side at the
// sm (600px) breakpoint; full viewport width below that.
const CIRCUIT_SIZES = '(min-width: 600px) min(50vw, 616px), 100vw'

// Stacked at xs, side by side from sm
const HALF = { xs: 4, sm: 4, md: 6 }

export function Methodology() {
  return (
    <View as="section" py={10}>
      <Flex layout={{ gutter: 6 }} alignItems="center" gap={6}>
        <Flex position="relative" span={HALF} aspectRatio={1} overflow="hidden" bg="default">
          <picture>
            {Object.entries(circuit.sources).map(([format, srcSet]) => (
              <source key={format} srcSet={srcSet} type={`image/${format}`} sizes={CIRCUIT_SIZES} />
            ))}
            <Image
              src={circuit.img.src}
              sizes={CIRCUIT_SIZES}
              alt="Macro view of server circuit boards tracing neon-green data paths"
              width="100%"
              height="100%"
              objectFit="cover"
            />
          </picture>
          <View position="absolute" top={0} left={0} width="100%" height="100%" bg="backdrop" />
          <View position="absolute" bottom={0} left={0} m={4} bg="default" p={4}>
            <Typography
              variant="h2"
              as="p"
              color="primary"
              fontWeight="black"
              lineHeight="none"
              m={0}
            >
              99.9%
            </Typography>
            <Typography
              variant="caption"
              as="p"
              color="secondary"
              letterSpacing="widest"
              mt={1}
              mb={0}
            >
              UPTIME_METHODOLOGY
            </Typography>
          </View>
        </Flex>

        <Flex span={HALF} gap={6}>
          <Eyebrow>
            <Typography
              variant="h2"
              color="initial"
              fontWeight="black"
              letterSpacing="tighter"
              m={0}
            >
              THE METHODOLOGY
            </Typography>
          </Eyebrow>
          <Flex gap={5}>
            {steps.map(({ number, title, body }) => (
              <Flex key={number} flexDirection="row" gap={3}>
                <Typography variant="body1" color="primary" fontWeight="bold" m={0}>
                  {number}
                </Typography>
                <View>
                  <Typography variant="h4" as="h3" color="initial" mb={1}>
                    {title}
                  </Typography>
                  <Typography variant="body2" color="secondary" lineHeight="relaxed" m={0}>
                    {body}
                  </Typography>
                </View>
              </Flex>
            ))}
          </Flex>
        </Flex>
      </Flex>
    </View>
  )
}
