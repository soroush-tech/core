import { DESIGN_SYSTEM_DOCS_URL } from 'src/pages/design/system/const'
import { Card } from '@soroush.tech/design-system/Card'
import { Tab, TabContext, TabList, TabPanel } from '@soroush.tech/design-system/Tabs'
import { Typography } from '@soroush.tech/design-system/Typography'
import { CardTitle } from './CardTitle'
import { TABS } from './TabsCard.data'

export function TabsCard() {
  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex={1}
      variant="bracketBox"
      title={<CardTitle title="TABS" docsHref={`${DESIGN_SYSTEM_DOCS_URL}/components/tabs/`} />}
      caption="A tablist moved by the arrow keys. In a TabContext, each tab of the TabList controls the TabPanel that shares its value."
    >
      <TabContext defaultValue={TABS[0].value}>
        <TabList aria-label="Package views">
          {TABS.map(({ value, label }) => (
            <Tab key={value} value={value} label={label} />
          ))}
        </TabList>
        {TABS.map(({ value, body }) => (
          <TabPanel key={value} value={value}>
            <Typography
              variant="caption"
              color="secondary"
              fontFamily="mono"
              display="block"
              pt={3}
            >
              {body}
            </Typography>
          </TabPanel>
        ))}
      </TabContext>
    </Card>
  )
}
