import avatar1x from 'src/assets/avatar/soroush_mascot_avatar@1x.png'
import avatar2x from 'src/assets/avatar/soroush_mascot_avatar@2x.png'
import avatar3x from 'src/assets/avatar/soroush_mascot_avatar@3x.png'
import portrait from 'src/assets/masoud_soroush.png?w=320;480;640;768;960;1200&format=avif;webp;png&as=picture'
import { STORYBOOK_URL } from 'src/config'
import { Avatar } from '@soroush.tech/design-system/Avatar'
import { Card } from '@soroush.tech/design-system/Card'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Image } from '@soroush.tech/design-system/Image'
import { Skeleton } from '@soroush.tech/design-system/Skeleton'
import { Typography } from '@soroush.tech/design-system/Typography'
import { View } from '@soroush.tech/design-system/View'
import { CardTitle } from './CardTitle'

// The card spans the content column; the three demos sit side by side from the
// first (40em) breakpoint, so each media slot is roughly a third of the row.
const MEDIA_SIZES = '(min-width: 640px) min(30vw, 400px), 100vw'

export function SkeletonCard() {
  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex={1}
      variant="bracketBox"
      title={
        <CardTitle
          title="SKELETON"
          storybookHref={`${STORYBOOK_URL}?path=/docs/theme-skeleton--docs`}
        />
      }
      caption="Loading placeholders in three shapes. pulse fades opacity so mixed sizes stay in lockstep; wave anchors its shimmer to the viewport. REAL_LOAD is the loaded post the skeletons stand in for."
    >
      <Flex flexDirection={['column', 'row']} gap={5}>
        <Flex flex="1">
          <Typography
            variant="caption"
            color="primary"
            opacity={0.5}
            display="block"
            mb={2}
            fontFamily="mono"
          >
            PULSE
          </Typography>
          <Flex flexDirection="row" gap={3} alignItems="center" mb={3}>
            <Skeleton variant="circular" width={40} height={40} />
            <Flex flex="1" gap={1}>
              <Skeleton width="60%" />
              <Skeleton width="40%" />
            </Flex>
          </Flex>
          <Skeleton
            data-testid="skeleton-pulse-rect"
            variant="rectangular"
            width="100%"
            height={400}
            borderRadius="md"
          />
        </Flex>
        <Flex flex="1">
          <Typography
            variant="caption"
            color="primary"
            opacity={0.5}
            display="block"
            mb={2}
            fontFamily="mono"
          >
            WAVE
          </Typography>
          <Flex flexDirection="row" gap={3} alignItems="center" mb={3}>
            <Skeleton animation="wave" variant="circular" width={40} height={40} />
            <Flex flex="1" gap={1}>
              <Skeleton animation="wave" width="60%" />
              <Skeleton animation="wave" width="40%" />
            </Flex>
          </Flex>
          <Skeleton
            data-testid="skeleton-wave-rect"
            animation="wave"
            variant="rectangular"
            width="100%"
            height={400}
            borderRadius="md"
          />
        </Flex>
        <Flex flex="1">
          <Typography
            variant="caption"
            color="primary"
            opacity={0.5}
            display="block"
            mb={2}
            fontFamily="mono"
          >
            REAL_LOAD
          </Typography>
          <Flex flexDirection="row" gap={3} alignItems="center" mb={3}>
            <Avatar
              size="md"
              variant="circular"
              alt="Soroush mascot"
              src={avatar1x}
              srcSet={`${avatar1x} 1x, ${avatar2x} 2x, ${avatar3x} 3x`}
            />
            <Flex gap={1}>
              <Typography variant="caption" color="initial" display="block" fontFamily="mono">
                MASOUD_SOROUSH
              </Typography>
              <Typography
                variant="caption"
                color="secondary"
                opacity={0.5}
                display="block"
                fontFamily="mono"
              >
                PRINCIPAL_ENGINEER
              </Typography>
            </Flex>
          </Flex>
          <View>
            <picture>
              {Object.entries(portrait.sources).map(([format, srcSet]) => (
                <source key={format} srcSet={srcSet} type={`image/${format}`} sizes={MEDIA_SIZES} />
              ))}
              <Image
                src={portrait.img.src}
                sizes={MEDIA_SIZES}
                alt="Portrait of Masoud Soroush, Principal Software Engineer"
                width="100%"
                height="400px"
                objectFit="cover"
                borderRadius="md"
              />
            </picture>
          </View>
        </Flex>
      </Flex>
    </Card>
  )
}
