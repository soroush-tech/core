import { STORYBOOK_URL } from 'src/config'
import { Card } from 'src/theme/Card'
import { Flex } from 'src/theme/Flex'
import { MenuItem } from 'src/theme/MenuItem'
import { NativeSelect } from 'src/theme/NativeSelect'
import { Select } from 'src/theme/Select'
import { Typography } from 'src/theme/Typography'
import { CardTitle } from './CardTitle'

const PLATFORMS = [
  { label: 'Web', value: 'web' },
  { label: 'Android', value: 'android' },
  { label: 'iOS', value: 'ios' },
]

export function SelectCard() {
  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex={1}
      variant="bracketBox"
      title={
        <CardTitle
          title="SELECT"
          storybookHref={`${STORYBOOK_URL}?path=/docs/theme-select--docs`}
        />
      }
      caption="Select renders a combobox trigger with a themeable portaled listbox of MenuItem options. NativeSelect is the real-<select> counterpart with the same Form/FormControl integration."
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
            CUSTOM_LISTBOX
          </Typography>
          <Select
            variant="outlined"
            placeholder="SELECT_PLATFORM"
            aria-label="custom platform select"
            fullWidth
          >
            {PLATFORMS.map(({ label, value }) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
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
            NATIVE_SELECT
          </Typography>
          <NativeSelect
            variant="outlined"
            placeholder="SELECT_PLATFORM"
            options={PLATFORMS}
            selectProps={{ 'aria-label': 'native platform select' }}
            fullWidth
          />
        </Flex>
      </Flex>
    </Card>
  )
}
