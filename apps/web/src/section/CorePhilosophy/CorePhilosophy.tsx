import { View } from '@soroush.tech/design-system/View'
import { Grid } from '@soroush.tech/design-system/Grid'
import { Typography } from '@soroush.tech/design-system/Typography'
import { IconCard } from 'src/common/IconCard'
import { Eyebrow } from 'src/common/Eyebrow'
import { pillars } from './CorePhilosophy.data'

export function CorePhilosophy() {
  return (
    <View as="section" py={10} px={4}>
      <View maxWidth="1280px" mx="auto">
        <Eyebrow>
          <Typography variant="h2" color="initial" letterSpacing="tighter">
            ARCHITECTURAL DECISIONS &amp; AI INTEGRATION
          </Typography>
        </Eyebrow>

        <Grid mt={8} gridTemplateColumns={['1fr', 'repeat(3, 1fr)']} gap={1}>
          {pillars.map(({ title, description, icon }) => (
            <IconCard key={title} icon={icon} title={title} body={description} />
          ))}
        </Grid>
      </View>
    </View>
  )
}
