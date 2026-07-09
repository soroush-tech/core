import { Headline } from 'src/common/Headline'
import { Layout } from 'src/common/Layout'
import { Flex } from 'src/theme/Flex'
import { Typography } from 'src/theme/Typography'
import { View } from 'src/theme/View'
import { AppBarCard } from './components/AppBarCard'
import { AvatarCard } from './components/AvatarCard'
import { BinaryControlsCard } from './components/BinaryControlsCard'
import { ButtonCard } from './components/ButtonCard'
import { ButtonGroupCard } from './components/ButtonGroupCard'
import { CircularProgressCard } from './components/CircularProgressCard'
import { ColorCard } from './components/ColorCard'
import { DrawerCard } from './components/DrawerCard'
import { FlexCard } from './components/FlexCard'
import { FontCard } from './components/FontCard'
import { FormCard } from './components/FormCard'
import { GridCard } from './components/GridCard'
import { ImageCard } from './components/ImageCard'
import { InteractiveColorSizeCard } from './components/InteractiveColorSizeCard'
import { LinearProgressCard } from './components/LinearProgressCard'
import { LinkCard } from './components/LinkCard'
import { ModalCard } from './components/ModalCard'
import { PaginationCard } from './components/PaginationCard'
import { PaperCard } from './components/PaperCard'
import { PopoverCard } from './components/PopoverCard'
import { PrimitiveContainerCard } from './components/PrimitiveContainerCard'
import { RadiusTokensCard } from './components/RadiusTokensCard'
import { SelectCard } from './components/SelectCard'
import { SkeletonCard } from './components/SkeletonCard'
import { TableCard } from './components/TableCard'
import { TextInputCard } from './components/TextInputCard'
import { TypographyCard } from './components/TypographyCard'
import { TypographyColorCard } from './components/TypographyColorCard'

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

        {/* ── 01 . Layout & Surfaces ───────────────────────────────────── */}
        <View as="section" mb={8} id="layout-surfaces">
          <Headline title="01 . Layout &amp; Surfaces" />

          <Flex flexDirection={['column', 'row']} gap={4} mb={4}>
            <PrimitiveContainerCard />
            <RadiusTokensCard />
            <PaperCard />
          </Flex>
          <Flex flexDirection={['column', 'row']} gap={4} mb={4}>
            <FlexCard />
            <GridCard />
          </Flex>
          <Flex flexDirection={['column', 'row']} gap={4} mb={4}>
            <AppBarCard />
            <DrawerCard />
          </Flex>
        </View>

        {/* ── 02 . Content & Data Display ──────────────────────────────── */}
        <View as="section" mb={8} id="content-data-display">
          <Headline title="02 . Content &amp; Data Display" />

          <Flex flexDirection={['column', 'row']} gap={4} mb={4}>
            <TypographyCard />
            <Flex flexDirection={'column'} gap={4}>
              <ColorCard />
              <FontCard />
            </Flex>
          </Flex>
          <Flex flexDirection={['column', 'row']} gap={4} mb={4}>
            <TypographyColorCard />
            <LinkCard />
          </Flex>
          <Flex flexDirection={['column', 'row']} gap={4} mb={4}>
            <AvatarCard />
            <ImageCard />
          </Flex>
          <Flex flexDirection={['column', 'row']} gap={4} mb={4}>
            <TableCard />
          </Flex>
        </View>

        {/* ── 03 . Inputs & Forms ──────────────────────────────────────── */}
        <View as="section" mb={8} id="inputs-forms">
          <Headline title="03 . Inputs &amp; Forms" />

          <Flex flexDirection={['column', 'row']} gap={4} mb={4}>
            <ButtonCard />
            <TextInputCard />
          </Flex>
          <Flex flexDirection={['column', 'row']} gap={4} mb={4}>
            <ButtonGroupCard />
            <BinaryControlsCard />
          </Flex>
          <Flex flexDirection={['column', 'row']} gap={4} mb={4}>
            <SelectCard />
            <PaginationCard />
          </Flex>
          <Flex flexDirection={['column', 'row']} gap={4} mb={4}>
            <FormCard />
            <InteractiveColorSizeCard />
          </Flex>
        </View>

        {/* ── 04 . Feedback ────────────────────────────────────────────── */}
        <View as="section" mb={8} id="feedback">
          <Headline title="04 . Feedback" />

          <Flex flexDirection={['column', 'row']} gap={4} mb={4}>
            <CircularProgressCard />
            <LinearProgressCard />
          </Flex>
          <Flex flexDirection={['column', 'row']} gap={4} mb={4}>
            <SkeletonCard />
          </Flex>
        </View>

        {/* ── 05 . Overlay & Behavior ──────────────────────────────────── */}
        <View as="section" mb={8} id="overlay-behavior">
          <Headline title="05 . Overlay &amp; Behavior" />

          <Flex flexDirection={['column', 'row']} gap={4}>
            <ModalCard />
            <PopoverCard />
          </Flex>
        </View>
      </View>
    </Layout>
  )
}
