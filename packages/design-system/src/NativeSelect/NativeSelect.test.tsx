import { describe, it, expect, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithTheme } from '../utils/test/renderWithTheme'
import { baseTheme } from '../themes'
import { FormControl } from '../FormControl'
import { NativeSelect, type NativeSelectOption } from './NativeSelect'

const options: NativeSelectOption[] = [
  { label: 'Ten', value: 10 },
  { label: 'Twenty', value: 20 },
  { label: 'Web', value: 'web' },
]

describe('NativeSelect', () => {
  it('renders a native select with all options', () => {
    renderWithTheme(<NativeSelect options={options} defaultValue={10} />)
    const select = screen.getByRole('combobox')
    expect(select.tagName).toBe('SELECT')
    expect(screen.getAllByRole('option')).toHaveLength(3)
    expect(screen.getByRole('option', { name: 'Twenty' })).toHaveValue('20')
  })

  it('defaults to the first option when no value, defaultValue, or placeholder is given', () => {
    renderWithTheme(<NativeSelect options={options} />)
    expect(screen.getByRole('combobox')).toHaveValue('10')
  })

  it('supports uncontrolled usage via defaultValue', () => {
    renderWithTheme(<NativeSelect options={options} defaultValue="web" />)
    expect(screen.getByRole('combobox')).toHaveValue('web')
  })

  it('supports controlled usage via value', () => {
    renderWithTheme(<NativeSelect options={options} value={20} onChange={() => {}} />)
    expect(screen.getByRole('combobox')).toHaveValue('20')
  })

  it('fires onChange with the original option value, preserving numbers', () => {
    const onChange = vi.fn()
    renderWithTheme(<NativeSelect options={options} defaultValue={10} onChange={onChange} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '20' } })
    expect(onChange).toHaveBeenCalledWith(20)
  })

  it('fires onChange with string values for string options', () => {
    const onChange = vi.fn()
    renderWithTheme(<NativeSelect options={options} defaultValue={10} onChange={onChange} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'web' } })
    expect(onChange).toHaveBeenCalledWith('web')
  })

  it('falls back to the raw DOM value when no option matches', () => {
    const onChange = vi.fn()
    renderWithTheme(
      <NativeSelect
        options={options}
        placeholder="Pick one"
        onChange={onChange}
        defaultValue={10}
      />
    )
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '' } })
    expect(onChange).toHaveBeenCalledWith('')
  })

  it('renders the placeholder as a hidden disabled option selected by default', () => {
    const { container } = renderWithTheme(<NativeSelect options={options} placeholder="Pick one" />)
    const placeholder = container.querySelector('option[value=""]')
    expect(placeholder).toHaveTextContent('Pick one')
    expect(placeholder).toBeDisabled()
    expect(screen.getByRole('combobox')).toHaveValue('')
  })

  it('inherits disabled and size from FormControl context', () => {
    renderWithTheme(
      <FormControl disabled size="lg">
        <NativeSelect options={options} defaultValue={10} />
      </FormControl>
    )
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('lets explicit props override FormControl context', () => {
    renderWithTheme(
      <FormControl disabled>
        <NativeSelect options={options} defaultValue={10} disabled={false} />
      </FormControl>
    )
    expect(screen.getByRole('combobox')).not.toBeDisabled()
  })

  it('applies the error border color on the root', () => {
    const { container } = renderWithTheme(
      <NativeSelect
        options={options}
        defaultValue={10}
        error
        variant="outlined"
        data-testid="root"
      />
    )
    const root = container.querySelector('[data-testid="root"]')
    // dark theme error main — neonRed[500]
    expect(root).toHaveStyle({ borderColor: 'rgb(255, 59, 48)' })
  })

  it('defaults the background to the terminal token and lets bg override it', () => {
    const { container: byDefault } = renderWithTheme(
      <NativeSelect options={options} defaultValue={10} data-testid="root" />
    )
    expect(byDefault.querySelector('[data-testid="root"]')).toHaveStyle({
      backgroundColor: baseTheme.background.terminal,
    })

    const { container: overridden } = renderWithTheme(
      <NativeSelect options={options} defaultValue={10} bg="paper" data-testid="root" />
    )
    expect(overridden.querySelector('[data-testid="root"]')).toHaveStyle({
      backgroundColor: baseTheme.background.paper,
    })
  })

  it('themes the dropdown options with the background and text tokens', () => {
    const { container: byDefault } = renderWithTheme(
      <NativeSelect options={options} defaultValue={10} />
    )
    expect(byDefault.querySelector('option')).toHaveStyle({
      backgroundColor: baseTheme.background.terminal,
      color: baseTheme.text.primary,
    })

    const { container: overridden } = renderWithTheme(
      <NativeSelect options={options} defaultValue={10} bg="paper" textColor="secondary" />
    )
    expect(overridden.querySelector('option')).toHaveStyle({
      backgroundColor: baseTheme.background.paper,
      color: baseTheme.text.secondary,
    })
  })

  it('stretches to full width when fullWidth is set', () => {
    const { container } = renderWithTheme(
      <NativeSelect options={options} defaultValue={10} fullWidth data-testid="root" />
    )
    expect(container.querySelector('[data-testid="root"]')).toHaveStyle({ width: '100%' })
  })

  it('renders variant underline with a bottom border only', () => {
    const { container } = renderWithTheme(
      <NativeSelect options={options} defaultValue={10} variant="underline" data-testid="root" />
    )
    expect(container.querySelector('[data-testid="root"]')).toHaveStyle({
      borderBottomStyle: 'solid',
    })
  })

  it('applies borderRadius on box variants and skips it on underline/text', () => {
    const { container: outlined } = renderWithTheme(
      <NativeSelect
        options={options}
        defaultValue={10}
        variant="outlined"
        borderRadius="md"
        data-testid="root"
      />
    )
    expect(outlined.querySelector('[data-testid="root"]')).toHaveStyle({ borderRadius: '8px' })

    const { container: text } = renderWithTheme(
      <NativeSelect
        options={options}
        defaultValue={10}
        variant="text"
        borderRadius="md"
        data-testid="root"
      />
    )
    expect(text.querySelector('[data-testid="root"]')).not.toHaveStyle({ borderRadius: '8px' })
  })

  it('renders the dropdown icon decoratively and allows overriding it', () => {
    const { container } = renderWithTheme(
      <NativeSelect options={options} defaultValue={10} iconName="chevron_right" />
    )
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('forwards native attributes to the select element', () => {
    renderWithTheme(
      <NativeSelect
        options={options}
        defaultValue={10}
        id="quantity"
        name="quantity"
        required
        selectProps={{ 'aria-label': 'Quantity' }}
      />
    )
    const select = screen.getByRole('combobox', { name: 'Quantity' })
    expect(select).toHaveAttribute('id', 'quantity')
    expect(select).toHaveAttribute('name', 'quantity')
    expect(select).toBeRequired()
  })
})
