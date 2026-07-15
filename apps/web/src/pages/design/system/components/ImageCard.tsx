import mascotDebugger from 'src/assets/soroush_mascot_debugger.png'
import mascotExplorer from 'src/assets/soroush_mascot_explorer.png'
import { STORYBOOK_URL } from 'src/config'
import { Card } from '@soroush.tech/design-system/Card'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Image } from '@soroush.tech/design-system/Image'
import { Typography } from '@soroush.tech/design-system/Typography'
import { CardTitle } from './CardTitle'

const FITS = ['cover', 'contain'] as const

export function ImageCard() {
  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex={1}
      variant="bracketBox"
      title={
        <CardTitle title="IMAGE" storybookHref={`${STORYBOOK_URL}?path=/docs/theme-image--docs`} />
      }
      caption="A styled-system <img> primitive with objectFit/objectPosition and built-in source recovery — a failing src advances to fallback before onError fires."
    >
      <Flex flexDirection="row" gap={4} flexWrap="wrap">
        {FITS.map((fit) => (
          <Flex key={fit} flex="1" minWidth="140px">
            <Typography
              variant="caption"
              color="secondary"
              opacity={0.5}
              display="block"
              mb={1}
              fontFamily="mono"
            >
              OBJECT_FIT_{fit.toUpperCase()}
            </Typography>
            <Image
              src={mascotDebugger}
              alt={`Soroush mascot debugging, object-fit ${fit}`}
              width="100%"
              height="140px"
              objectFit={fit}
            />
          </Flex>
        ))}
        <Flex flex="1" minWidth="140px">
          <Typography
            variant="caption"
            color="secondary"
            opacity={0.5}
            display="block"
            mb={1}
            fontFamily="mono"
          >
            FALLBACK_RECOVERY
          </Typography>
          <Image
            src="/broken-source.png"
            fallback={mascotExplorer}
            alt="Soroush mascot exploring, loaded via fallback"
            width="100%"
            height="140px"
            objectFit="cover"
          />
        </Flex>
      </Flex>
    </Card>
  )
}
