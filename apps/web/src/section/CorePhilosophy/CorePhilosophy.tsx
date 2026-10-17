import { View } from '@soroush.tech/design-system/View'
import { Grid } from '@soroush.tech/design-system/Grid'
import { Typography } from '@soroush.tech/design-system/Typography'
import { IconCard } from 'src/common/IconCard'
import { Eyebrow } from 'src/common/Eyebrow'
import { pillars } from './CorePhilosophy.data'

export function CorePhilosophy() {
  return (
    <View as="section" py={10}>
      {/* 12 columns at sm (the theme has 8) so the three cards stay three across */}
      <Grid layout={{ gutter: 1, sm: { columns: 12 } }} gap={1}>
        <Eyebrow span={{ xs: 4, sm: 12 }} mb={7}>
          <Typography variant="h2" color="initial" letterSpacing="tighter">
            ARCHITECTURAL DECISIONS &amp; AI INTEGRATION
          </Typography>
        </Eyebrow>

        {pillars.map(({ title, description, icon }) => (
          <IconCard key={title} icon={icon} title={title} body={description} span={4} />
        ))}
      </Grid>
    </View>
  )
}
