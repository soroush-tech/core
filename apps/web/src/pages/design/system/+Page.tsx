import { Headline } from 'src/common/Headline'
import { Layout } from 'src/common/Layout'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Typography } from '@soroush.tech/design-system/Typography'
import { View } from '@soroush.tech/design-system/View'
import { AccordionCard } from './components/AccordionCard'
import { AlertCard } from './components/AlertCard'
import { AppBarCard } from './components/AppBarCard'
import { AutocompleteCard } from './components/AutocompleteCard'
import { AvatarCard } from './components/AvatarCard'
import { BadgeCard } from './components/BadgeCard'
import { BinaryControlsCard } from './components/BinaryControlsCard'
import { BreadcrumbsCard } from './components/BreadcrumbsCard'
import { ButtonCard } from './components/ButtonCard'
import { ButtonGroupCard } from './components/ButtonGroupCard'
import { ChipCard } from './components/ChipCard'
import { CircularProgressCard } from './components/CircularProgressCard'
import { CollapseCard } from './components/CollapseCard'
import { ColorCard } from './components/ColorCard'
import { DrawerCard } from './components/DrawerCard'
import { FabCard } from './components/FabCard'
import { FabMenuCard } from './components/FabMenuCard'
import { FadeCard } from './components/FadeCard'
import { FlexCard } from './components/FlexCard'
import { FontCard } from './components/FontCard'
import { FormCard } from './components/FormCard'
import { GridCard } from './components/GridCard'
import { GrowCard } from './components/GrowCard'
import { ImageCard } from './components/ImageCard'
import { InteractiveColorSizeCard } from './components/InteractiveColorSizeCard'
import { LinearProgressCard } from './components/LinearProgressCard'
import { LinkCard } from './components/LinkCard'
import { MenuCard } from './components/MenuCard'
import { ModalCard } from './components/ModalCard'
import { NavTreeCard } from './components/NavTreeCard'
import { NumberInputCard } from './components/NumberInputCard'
import { PaginationCard } from './components/PaginationCard'
import { PaperCard } from './components/PaperCard'
import { PopoverCard } from './components/PopoverCard'
import { PressableCard } from './components/PressableCard'
import { PrimitiveContainerCard } from './components/PrimitiveContainerCard'
import { RadiusTokensCard } from './components/RadiusTokensCard'
import { RangeInputCard } from './components/RangeInputCard'
import { RatingCard } from './components/RatingCard'
import { ScrollAreaCard } from './components/ScrollAreaCard'
import { SelectCard } from './components/SelectCard'
import { SidebarCard } from './components/SidebarCard'
import { SkeletonCard } from './components/SkeletonCard'
import { SlideCard } from './components/SlideCard'
import { SnackbarCard } from './components/SnackbarCard'
import { TableCard } from './components/TableCard'
import { TabsCard } from './components/TabsCard'
import { TextInputCard } from './components/TextInputCard'
import { ToggleButtonCard } from './components/ToggleButtonCard'
import { TooltipCard } from './components/TooltipCard'
import { TransferListCard } from './components/TransferListCard'
import { TypographyCard } from './components/TypographyCard'
import { TypographyColorCard } from './components/TypographyColorCard'
import { ZoomCard } from './components/ZoomCard'

export default function SystemDesignPage() {
  return (
    <Layout blueprintProps={{ variant: 'dot', scanline: true, as: 'main', pb: 6 }}>
      <View layout pt={4}>
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
            A comprehensive documentation of the Soroush Design System - scalable components, strict
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
            <ScrollAreaCard />
          </Flex>
          <Flex flexDirection={['column', 'row']} gap={4} mb={4}>
            <DrawerCard />
            <SidebarCard />
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
          <Flex flexDirection={['column', 'row']} gap={4} mb={4}>
            <AccordionCard />
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
          <Flex flexDirection={['column', 'row']} gap={4} mb={4}>
            <ToggleButtonCard />
            <FabCard />
          </Flex>
          <Flex flexDirection={['column', 'row']} gap={4} mb={4}>
            <NumberInputCard />
            <RangeInputCard />
          </Flex>
          <Flex flexDirection={['column', 'row']} gap={4} mb={4}>
            <RatingCard />
            <AutocompleteCard />
          </Flex>
          <Flex flexDirection={['column', 'row']} gap={4} mb={4}>
            <TransferListCard />
          </Flex>
        </View>

        {/* ── 04 . Navigation & Menus ──────────────────────────────────── */}
        <View as="section" mb={8} id="navigation-menus">
          <Headline title="04 . Navigation &amp; Menus" />

          <Flex flexDirection={['column', 'row']} gap={4} mb={4}>
            <BreadcrumbsCard />
            <TabsCard />
          </Flex>
          <Flex flexDirection={['column', 'row']} gap={4} mb={4}>
            <MenuCard />
            <NavTreeCard />
          </Flex>
        </View>

        {/* ── 05 . Feedback ────────────────────────────────────────────── */}
        <View as="section" mb={8} id="feedback">
          <Headline title="05 . Feedback" />

          <Flex flexDirection={['column', 'row']} gap={4} mb={4}>
            <CircularProgressCard />
            <LinearProgressCard />
          </Flex>
          <Flex flexDirection={['column', 'row']} gap={4} mb={4}>
            <SkeletonCard />
          </Flex>
          <Flex flexDirection={['column', 'row']} gap={4} mb={4}>
            <AlertCard />
            <SnackbarCard />
          </Flex>
          <Flex flexDirection={['column', 'row']} gap={4} mb={4}>
            <BadgeCard />
            <ChipCard />
            <FabMenuCard />
          </Flex>
        </View>

        {/* ── 06 . Animation ───────────────────────────────────────────── */}
        <View as="section" mb={8} id="animation">
          <Headline title="06 . Animation" />

          <Flex flexDirection={['column', 'row']} gap={4} mb={4}>
            <CollapseCard />
            <FadeCard />
            <GrowCard />
          </Flex>
          <Flex flexDirection={['column', 'row']} gap={4} mb={4}>
            <SlideCard />
            <ZoomCard />
          </Flex>
        </View>

        {/* ── 07 . Overlay & Behavior ──────────────────────────────────── */}
        <View as="section" mb={8} id="overlay-behavior">
          <Headline title="07 . Overlay &amp; Behavior" />

          <Flex flexDirection={['column', 'row']} gap={4} mb={4}>
            <ModalCard />
            <PopoverCard />
          </Flex>
          <Flex flexDirection={['column', 'row']} gap={4}>
            <TooltipCard />
            <PressableCard />
          </Flex>
        </View>
      </View>
    </Layout>
  )
}
