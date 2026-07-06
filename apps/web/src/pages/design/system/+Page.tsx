import { Headline } from 'src/common/Headline'
import { Layout } from 'src/common/Layout'
import { Flex } from 'src/theme/Flex'
import { Typography } from 'src/theme/Typography'
import { View } from 'src/theme/View'
import { AvatarCard } from './components/AvatarCard'
import { ColorCard } from './components/ColorCard'
import { BinaryControlsCard } from './components/BinaryControlsCard'
import { ButtonCard } from './components/ButtonCard'
import { CircularProgressCard } from './components/CircularProgressCard'
import { FlexCard } from './components/FlexCard'
import { GridCard } from './components/GridCard'
import { PaperCard } from './components/PaperCard'
import { LinkCard } from './components/LinkCard'
import { PrimitiveContainerCard } from './components/PrimitiveContainerCard'
import { RadiusTokensCard } from './components/RadiusTokensCard'
import { TextInputCard } from './components/TextInputCard'
import { TypographyCard } from './components/TypographyCard'
import { FontCard } from './components/FontCard'
import { TypographyColorCard } from './components/TypographyColorCard'
import { InteractiveColorSizeCard } from './components/InteractiveColorSizeCard'
import { TableCard } from './components/TableCard'

export default function SystemDesignPage() {
  return (
    <Layout blueprintProps={{ variant: 'dot', scanline: true, as: 'main', px: [3, 5, 6], pb: 6 }}>
      <View pt={4} maxWidth="1280px" mx="auto">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <View mb={8}>
          <Typography
            variant="caption"
            letterSpacing="widest"
            color="primary"
            display="block"
            mb={2}
            fontFamily="mono"
          >
            SYSTEM_SHOWCASE_V1.0
          </Typography>
          <Typography variant="h1" letterSpacing="tighter" color="initial" mb={3}>
            Design System
          </Typography>
          <Typography variant="body1" color="secondary" lineHeight="relaxed">
            A comprehensive documentation of the Soroush Design System — scalable components, strict
            structural consistency, and production-grade developer experience.
          </Typography>
        </View>

        {/* ── 01 . Typography ─────────────────────────────────────────────── */}
        <View as="section" mb={8} id="typography">
          <Headline title="01 . Typography" />

          <Flex flexDirection={['column', 'row']} gap={4}>
            <TypographyCard />
            <Flex flexDirection={'column'} gap={4}>
              <ColorCard />
              <FontCard />
            </Flex>
          </Flex>
        </View>
        {/* ── 02.Core Layout ────────────────────────────────────────────── */}
        <View as="section" mb={8} id="primitives">
          <Headline title="02 . Core Layout" />

          <Flex flexDirection={['column', 'row']} gap={4} mb={4}>
            <PrimitiveContainerCard />
            <RadiusTokensCard />
            <PaperCard />
          </Flex>
          <Flex flexDirection={['column', 'row']} gap={4} mb={4}>
            <FlexCard />
            <GridCard />
          </Flex>
        </View>
        {/* ── 03. Interactive Controls ──────────────────────────────────── */}
        <View as="section" mb={8} id="interactive">
          <Headline title="03 . Interactive Controls" />

          <Flex flexDirection={['column', 'row']} gap={4} mb={4}>
            <ButtonCard />
            <TextInputCard />
          </Flex>
          <Flex flexDirection={['column', 'row']} gap={4} mb={4}>
            <BinaryControlsCard />
            <LinkCard />
          </Flex>
        </View>

        {/* ── 04 . Media ────────────────────────────────────────────── */}
        <View as="section" mb={8} id="media">
          <Headline title="04 . Media" />
          <Flex flexDirection={['column', 'row']} gap={4}>
            <AvatarCard />
            <CircularProgressCard />
          </Flex>
        </View>

        {/* ── 05. Color & Size ─────────────────────────────────────────── */}
        <View as="section" mb={8} id="color-size">
          <Headline title="05 . Color &amp; Size" />
          <Flex flexDirection={['column', 'row']} gap={4}>
            <TypographyColorCard />
            <InteractiveColorSizeCard />
          </Flex>
        </View>

        {/* ── 06. Data Display ─────────────────────────────────────────── */}
        <View as="section" mb={8} id="data-display">
          <Headline title="06 . Data Display" />
          <Flex flexDirection={['column', 'row']} gap={4}>
            <TableCard />
          </Flex>
        </View>
      </View>
    </Layout>
  )
}
