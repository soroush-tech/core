import { useForm, revalidateLogic } from '@tanstack/react-form'
import { z } from 'zod'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from '../utils/test/renderWithTheme'
import { TextInput } from '../TextInput'
import { Field } from './Field'

const schema = z.object({ email: z.email('Invalid email'), note: z.string() })
type Values = z.infer<typeof schema>

const defaultValues: Values = { email: '', note: '' }

function Harness({ label, helperText }: { label?: string; helperText?: string }) {
  const form = useForm({
    defaultValues,
    validationLogic: revalidateLogic({ mode: 'blur', modeAfterSubmission: 'change' }),
    validators: { onDynamic: schema },
  })
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <Field form={form} name="email" label={label} helperText={helperText}>
        <TextInput />
      </Field>
      <button type="submit">Submit</button>
    </form>
  )
}

describe('Field', () => {
  it('renders the label and the control', () => {
    renderWithTheme(<Harness label="Email" />)
    expect(screen.getByText('Email').tagName.toLowerCase()).toBe('label')
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('associates the label with the control', () => {
    renderWithTheme(<Harness label="Email" />)
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument()
  })

  it('shows the helper text when there is no error', () => {
    renderWithTheme(<Harness label="Email" helperText="We'll never share it" />)
    expect(screen.getByText("We'll never share it")).toBeInTheDocument()
  })

  it('renders no label or helper text when neither is provided', () => {
    renderWithTheme(<Harness />)
    expect(screen.queryByText('Invalid email')).not.toBeInTheDocument()
    expect(document.querySelector('label')).not.toBeInTheDocument()
  })

  it('does not show an error on initial render', () => {
    renderWithTheme(<Harness label="Email" />)
    expect(screen.queryByText('Invalid email')).not.toBeInTheDocument()
  })

  it('shows the error after the field is touched (blur)', async () => {
    renderWithTheme(<Harness label="Email" helperText="We'll never share it" />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'not-an-email' } })
    fireEvent.blur(input)
    expect(await screen.findByText('Invalid email')).toBeInTheDocument()
    // The error replaces the helper text.
    expect(screen.queryByText("We'll never share it")).not.toBeInTheDocument()
  })

  it('shows the error after a submit attempt', async () => {
    renderWithTheme(<Harness label="Email" />)
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
    expect(await screen.findByText('Invalid email')).toBeInTheDocument()
  })

  it('marks the helper text as an alert in the error state', async () => {
    renderWithTheme(<Harness label="Email" />)
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => expect(screen.getByText('Invalid email')).toHaveAttribute('role', 'alert'))
  })
})
