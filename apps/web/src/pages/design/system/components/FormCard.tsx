import { useForm } from '@tanstack/react-form'
import { STORYBOOK_URL } from 'src/config'
import { Button } from 'src/theme/Button'
import { Card } from 'src/theme/Card'
import { Field } from 'src/theme/Field'
import { Flex } from 'src/theme/Flex'
import { Form } from 'src/theme/Form'
import { FormControl } from 'src/theme/FormControl'
import { FormHelperText } from 'src/theme/FormHelperText'
import { FormLabel } from 'src/theme/FormLabel'
import { MenuItem } from 'src/theme/MenuItem'
import { Select } from 'src/theme/Select'
import { TextInput } from 'src/theme/TextInput'
import { View } from 'src/theme/View'
import { CardTitle } from './CardTitle'

export function FormCard() {
  const form = useForm({ defaultValues: { callsign: '' } })

  return (
    <Card
      elevation={0}
      bg="paper"
      p={5}
      flex={1}
      variant="bracketBox"
      title={
        <CardTitle title="FORM" storybookHref={`${STORYBOOK_URL}?path=/docs/theme-form--docs`} />
      }
      caption="Form provides field-wide defaults via context; Field bridges to TanStack Form and composes FormControl, FormLabel, and FormHelperText — shown standalone below in the error state."
    >
      <Form
        data-testid="form-demo"
        noValidate
        textColor="initial"
        onSubmit={(event) => {
          event.preventDefault()
          form.handleSubmit()
        }}
      >
        <Flex flexDirection="column" gap={5}>
          <Field
            form={form}
            name="callsign"
            label="CALLSIGN"
            helperText="Visible on the public roster."
            required
            fullWidth
          >
            <TextInput variant="underline" placeholder="e.g. NIGHTHAWK" />
          </Field>
          <FormControl fullWidth>
            <FormLabel>CHANNEL</FormLabel>
            <Select variant="outlined" placeholder="SELECT_CHANNEL">
              <MenuItem value="alpha">Alpha</MenuItem>
              <MenuItem value="bravo">Bravo</MenuItem>
              <MenuItem value="cipher">Cipher</MenuItem>
            </Select>
          </FormControl>
          <FormControl error fullWidth>
            <FormLabel>ACCESS_CODE</FormLabel>
            <TextInput variant="outlined" placeholder="****" />
            <FormHelperText>ERR_INVALID_CODE — request a new code.</FormHelperText>
          </FormControl>
          <View>
            <Button type="submit" variant="contained" size="md">
              SUBMIT
            </Button>
          </View>
        </Flex>
      </Form>
    </Card>
  )
}
