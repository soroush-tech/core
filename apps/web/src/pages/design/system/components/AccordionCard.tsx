import { DESIGN_SYSTEM_DOCS_URL } from 'src/pages/design/system/const'
import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
} from '@soroush.tech/design-system/Accordion'
import { Card } from '@soroush.tech/design-system/Card'
import { Typography } from '@soroush.tech/design-system/Typography'
import { CardTitle } from './CardTitle'

const SECTIONS = [
  {
    id: 'deploy',
    title: 'DEPLOY_PIPELINE',
    body: 'Lint, test, and build run on every push; main deploys to the edge.',
  },
  {
    id: 'tokens',
    title: 'DESIGN_TOKENS',
    body: 'Spacing, colour, radii, and type scale all resolve from the active theme.',
  },
  {
    id: 'a11y',
    title: 'ACCESSIBILITY',
    body: 'Each summary is a button in a heading; the region it opens is named by it.',
  },
]

export function AccordionCard() {
  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex={1}
      variant="bracketBox"
      title={
        <CardTitle title="ACCORDION" docsHref={`${DESIGN_SYSTEM_DOCS_URL}/components/accordion/`} />
      }
      caption="A heading that opens and closes a region. Grouped with isExclusive, opening one closes the others; arrows, Home, and End move between summaries."
    >
      <AccordionGroup isExclusive variant="attached">
        {SECTIONS.map((section, index) => (
          <Accordion key={section.id} defaultExpanded={index === 0} bg="default">
            <AccordionSummary>
              <Typography as="span" variant="caption" fontFamily="mono" letterSpacing="wide">
                {section.title}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="caption" color="secondary" fontFamily="mono">
                {section.body}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </AccordionGroup>
    </Card>
  )
}
