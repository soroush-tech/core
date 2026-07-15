import { useForm } from '@tanstack/react-form'
import { STORYBOOK_URL } from 'src/config'
import { Button } from '@soroush.tech/design-system/Button'
import { Card } from '@soroush.tech/design-system/Card'
import { Field } from '@soroush.tech/design-system/Field'
import { Flex } from '@soroush.tech/design-system/Flex'
import { Form } from '@soroush.tech/design-system/Form'
import { FormControl } from '@soroush.tech/design-system/FormControl'
import { FormHelperText } from '@soroush.tech/design-system/FormHelperText'
import { FormLabel } from '@soroush.tech/design-system/FormLabel'
import { MenuItem } from '@soroush.tech/design-system/MenuItem'
import { Select } from '@soroush.tech/design-system/Select'
import { TextInput } from '@soroush.tech/design-system/TextInput'
import { View } from '@soroush.tech/design-system/View'
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
