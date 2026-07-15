import { View } from '@soroush.tech/design-system/View'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Grid } from '@soroush.tech/design-system/Grid'
import { Typography } from '@soroush.tech/design-system/Typography'
import { type IconName } from '@soroush.tech/design-system/Icon'
import { IconCard } from 'src/common/IconCard'
import { Eyebrow } from 'src/common/Eyebrow'

const values: Array<{ icon: IconName; title: string; body: string }> = [
  {
    icon: 'psychology',
    title: 'PROBLEM SOLVING',
    body: 'Treating every complex challenge as a nested logic puzzle requiring architectural decompression.',
  },
  {
    icon: 'settings_input_component',
    title: 'SELF-MANAGEMENT',
    body: 'Autonomous execution and prioritization frameworks designed for high-output environments.',
  },
  {
    icon: 'ads_click',
    title: 'GOAL ORIENTATION',
    body: 'Laser-focused on the destination, ensuring every line of code contributes to the final objective.',
  },
  {
    icon: 'groups',
    title: 'TEAM COLLABORATION',
    body: 'Bridging the gap between engineering silos through clear communication and shared vision.',
  },
  {
    icon: 'visibility',
    title: 'CLARITY',
    body: 'Removing ambiguity from technical documentation and system design for long-term scalability.',
  },
  {
    icon: 'speed',
    title: 'EFFICIENCY',
    body: 'Algorithmic and operational optimization to reduce technical debt and maximize performance.',
  },
]

export function CoreValues() {
  return (
    <View as="section" py={10} px={4}>
      <View maxWidth="1280px" mx="auto">
        <Flex
          flexDirection={['column', 'row']}
          justifyContent="space-between"
          alignItems={['flex-start', 'flex-end']}
          gap={3}
          mb={4}
        >
          <Eyebrow>
            <Typography variant="h2" color="initial" fontWeight="bold" letterSpacing="tighter">
              CORE VALUES
            </Typography>
          </Eyebrow>
        </Flex>

        <Grid gridTemplateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)']} gap={1}>
          {values.map(({ icon, title, body }) => (
            <IconCard key={title} icon={icon} title={title} body={body} />
          ))}
        </Grid>
      </View>
    </View>
  )
}
