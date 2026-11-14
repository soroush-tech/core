import { useState } from 'react'
import { DESIGN_SYSTEM_DOCS_URL } from 'src/pages/design/system/const'
import { Autocomplete } from '@soroush.tech/design-system/Autocomplete'
import { Card } from '@soroush.tech/design-system/Card'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Typography } from '@soroush.tech/design-system/Typography'
import { CardTitle } from './CardTitle'
import { REGIONS, STACK_TAGS } from './AutocompleteCard.data'

export function AutocompleteCard() {
  const [region, setRegion] = useState<string | null>(null)

  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex={1}
      variant="bracketBox"
      title={
        <CardTitle
          title="AUTOCOMPLETE"
          docsHref={`${DESIGN_SYSTEM_DOCS_URL}/components/autocomplete/`}
        />
      }
      caption="A combobox whose text filters a portaled listbox. It picks one option, or several shown as Chips with multiple - and every label is yours."
    >
      <Flex flexDirection={['column', 'row']} gap={5}>
        <Flex flex="1">
          <Typography
            variant="caption"
            color="secondary"
            opacity={0.5}
            display="block"
            mb={2}
            fontFamily="mono"
          >
            SINGLE
          </Typography>
          <Autocomplete
            options={REGIONS}
            value={region}
            onChange={(_event, value) => setRegion(value)}
            aria-label="Region"
            placeholder="FIND_REGION"
            noOptionsText="No region matches"
            clearLabel="Clear region"
            openLabel="Open regions"
            closeLabel="Close regions"
            variant="outlined"
            fullWidth
          />
          <Typography variant="caption" color="secondary" fontFamily="mono" mt={2}>
            REGION: {region ?? 'NONE'}
          </Typography>
        </Flex>
        <Flex flex="1">
          <Typography
            variant="caption"
            color="secondary"
            opacity={0.5}
            display="block"
            mb={2}
            fontFamily="mono"
          >
            MULTIPLE · CHIPS
          </Typography>
          <Autocomplete
            multiple
            options={STACK_TAGS}
            defaultValue={['React', 'Vite']}
            aria-label="Stack"
            noOptionsText="No tag matches"
            getRemoveLabel={(label) => `Remove ${label}`}
            variant="outlined"
            fullWidth
          />
        </Flex>
      </Flex>
    </Card>
  )
}
