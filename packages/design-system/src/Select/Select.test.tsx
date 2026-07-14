import { describe, it, expect, vi } from 'vitest'
import { fireEvent, screen, within } from '@testing-library/react'
import { renderWithTheme } from '../utils/test/renderWithTheme'
import { dark } from '../themes'
import { MenuItem } from '../MenuItem'
import { Select } from './Select'

const options = [
  <MenuItem key={1} value={1}>
    One
  </MenuItem>,
  <MenuItem key={2} value={2}>
    Two
  </MenuItem>,
  <MenuItem key={3} value={3}>
    Three
  </MenuItem>,
]

const openMenu = () => fireEvent.click(screen.getByRole('combobox'))

describe('Select (native path)', () => {
  it('delegates to a native select and reports the chosen value', () => {
    const onChange = vi.fn()
    renderWithTheme(
      <Select native defaultValue={1} onChange={onChange}>
        {options}
      </Select>
    )
    const select = screen.getByRole('combobox')
    expect(select.tagName).toBe('SELECT')
    expect(screen.getAllByRole('option')).toHaveLength(3)

    fireEvent.change(select, { target: { value: '2' } })
    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('coerces non-string labels and ignores array values on the native path', () => {
    renderWithTheme(
      <Select native value={[1]} defaultValue={[1]} onChange={() => {}}>
        <MenuItem value={5}>{5}</MenuItem>
        <MenuItem value={6}>{6}</MenuItem>
      </Select>
    )
    // Array value/defaultValue collapse to no selection; the browser shows the first option.
    expect(screen.getByRole('option', { name: '5' })).toHaveValue('5')
  })
})

describe('Select (non-native)', () => {
  it('renders a combobox trigger with the placeholder while empty', () => {
    renderWithTheme(
      <Select placeholder="Pick one" aria-label="picker">
        {options}
      </Select>
    )
    const trigger = screen.getByRole('combobox', { name: 'picker' })
    expect(trigger).toHaveTextContent('Pick one')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveAttribute('tabindex', '0')
  })

  it('renders the placeholder in the configured text color, not a dimmed color', () => {
    renderWithTheme(
      <Select placeholder="Pick one" textColor="secondary">
        {options}
      </Select>
    )
    expect(screen.getByRole('combobox')).toHaveStyle({ color: dark.text.secondary })
  })

  it('defaults the trigger text to the color main, overridable by textColor', () => {
    const { rerender } = renderWithTheme(<Select color="error">{options}</Select>)
    expect(screen.getByRole('combobox')).toHaveStyle({ color: dark.palette.error.main })
    rerender(
      <Select color="error" textColor="secondary">
        {options}
      </Select>
    )
    expect(screen.getByRole('combobox')).toHaveStyle({ color: dark.text.secondary })
  })

  it('reserves the widest option width by default (hidden sizer) to avoid layout shift', () => {
    renderWithTheme(<Select placeholder="Pick">{options}</Select>)
    // With nothing selected and the menu closed, option labels exist only in the hidden sizer.
    expect(screen.getByText('One')).toBeInTheDocument()
    expect(screen.getByText('Three')).toBeInTheDocument()
  })

  it('does not stretch in a flex container unless fullWidth is set', () => {
    const { rerender } = renderWithTheme(<Select>{options}</Select>)
    expect(screen.getByRole('combobox')).toHaveStyle({ alignSelf: 'flex-start' })
    rerender(<Select fullWidth>{options}</Select>)
    expect(screen.getByRole('combobox')).toHaveStyle({ width: '100%' })
  })

  it('sizes to the current content when autoWidth is set (no sizer)', () => {
    renderWithTheme(
      <Select autoWidth placeholder="Pick">
        {options}
      </Select>
    )
    expect(screen.queryByText('One')).not.toBeInTheDocument()
  })

  it('opens on click, selects an option, and closes', () => {
    const onChange = vi.fn()
    renderWithTheme(<Select onChange={onChange}>{options}</Select>)

    openMenu()
    const listbox = screen.getByRole('listbox')
    expect(within(listbox).getAllByRole('option')).toHaveLength(3)

    fireEvent.click(within(listbox).getByText('Two'))
    expect(onChange).toHaveBeenCalledWith(2)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(screen.getByRole('combobox')).toHaveTextContent('Two')
  })

  it('toggles the menu closed when the trigger is clicked again', () => {
    renderWithTheme(<Select>{options}</Select>)
    openMenu()
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    openMenu()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('closes when focus leaves the trigger', () => {
    renderWithTheme(<Select>{options}</Select>)
    openMenu()
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    fireEvent.blur(screen.getByRole('combobox'))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('supports keyboard open, highlight movement, and selection', () => {
    const onChange = vi.fn()
    renderWithTheme(<Select onChange={onChange}>{options}</Select>)
    const trigger = screen.getByRole('combobox')

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(trigger).toHaveAttribute('aria-activedescendant', expect.stringContaining('option-0'))

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(trigger).toHaveAttribute('aria-activedescendant', expect.stringContaining('option-1'))
    fireEvent.keyDown(trigger, { key: 'ArrowUp' })
    expect(trigger).toHaveAttribute('aria-activedescendant', expect.stringContaining('option-0'))
    fireEvent.keyDown(trigger, { key: 'End' })
    expect(trigger).toHaveAttribute('aria-activedescendant', expect.stringContaining('option-2'))
    fireEvent.keyDown(trigger, { key: 'Home' })
    expect(trigger).toHaveAttribute('aria-activedescendant', expect.stringContaining('option-0'))

    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith(1)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('opens with Space and ArrowUp, and closes with Escape', () => {
    renderWithTheme(<Select>{options}</Select>)
    const trigger = screen.getByRole('combobox')

    fireEvent.keyDown(trigger, { key: 'ArrowUp' })
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    fireEvent.keyDown(trigger, { key: 'Escape' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    fireEvent.keyDown(trigger, { key: ' ' })
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    // A key with no binding is ignored.
    fireEvent.keyDown(trigger, { key: 'a' })
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('starts the highlight at the current value when opening', () => {
    renderWithTheme(
      <Select value={2} onChange={() => {}}>
        {options}
      </Select>
    )
    openMenu()
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-activedescendant',
      expect.stringContaining('option-1')
    )
  })

  it('falls back to the first option when the value matches nothing', () => {
    renderWithTheme(
      <Select value={99} onChange={() => {}}>
        {options}
      </Select>
    )
    openMenu()
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-activedescendant',
      expect.stringContaining('option-0')
    )
  })

  it('skips disabled options when highlighting', () => {
    renderWithTheme(
      <Select>
        <MenuItem value={1} disabled>
          One
        </MenuItem>
        <MenuItem value={2}>Two</MenuItem>
      </Select>
    )
    const trigger = screen.getByRole('combobox')
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(trigger).toHaveAttribute('aria-activedescendant', expect.stringContaining('option-1'))
  })

  it('does nothing on Enter when every option is disabled', () => {
    const onChange = vi.fn()
    renderWithTheme(
      <Select onChange={onChange}>
        <MenuItem value={1} disabled>
          One
        </MenuItem>
      </Select>
    )
    const trigger = screen.getByRole('combobox')
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(trigger).not.toHaveAttribute('aria-activedescendant')
    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('supports multiple selection and keeps the menu open', () => {
    const onChange = vi.fn()
    renderWithTheme(
      <Select multiple onChange={onChange}>
        {options}
      </Select>
    )
    openMenu()
    fireEvent.click(within(screen.getByRole('listbox')).getByText('One'))
    expect(onChange).toHaveBeenLastCalledWith([1])
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    fireEvent.click(within(screen.getByRole('listbox')).getByText('Three'))
    expect(onChange).toHaveBeenLastCalledWith([1, 3])
    expect(screen.getByRole('combobox')).toHaveTextContent('One, Three')
  })

  it('accumulates selections after multiple is turned on post-mount', () => {
    const onChange = vi.fn()
    const { rerender } = renderWithTheme(<Select onChange={onChange}>{options}</Select>)
    // `multiple` toggled on after mount — the value ('' from single mode) must normalize to [].
    rerender(
      <Select multiple onChange={onChange}>
        {options}
      </Select>
    )
    openMenu()
    fireEvent.click(within(screen.getByRole('listbox')).getByText('One'))
    expect(onChange).toHaveBeenLastCalledWith([1])
    fireEvent.click(within(screen.getByRole('listbox')).getByText('Two'))
    expect(onChange).toHaveBeenLastCalledWith([1, 2])
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('normalizes an array value to empty in single mode', () => {
    renderWithTheme(
      <Select value={[1]} placeholder="Pick" onChange={() => {}}>
        {options}
      </Select>
    )
    expect(screen.getByRole('combobox')).toHaveTextContent('Pick')
  })

  it('leaves the value untouched in controlled mode, only reporting the change', () => {
    const onChange = vi.fn()
    renderWithTheme(
      <Select value={1} onChange={onChange}>
        {options}
      </Select>
    )
    openMenu()
    fireEvent.click(within(screen.getByRole('listbox')).getByText('Two'))
    expect(onChange).toHaveBeenCalledWith(2)
    // Controlled: display reflects the prop, not the click, until the parent updates.
    expect(screen.getByRole('combobox')).toHaveTextContent('One')
  })

  it('honors controlled open state and fires onClose', () => {
    const onClose = vi.fn()
    renderWithTheme(
      <Select open onClose={onClose}>
        {options}
      </Select>
    )
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
    // Controlled: stays open until the parent changes the prop.
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('is inert when disabled', () => {
    renderWithTheme(<Select disabled>{options}</Select>)
    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveAttribute('tabindex', '-1')
    expect(trigger).toHaveAttribute('aria-disabled', 'true')
    fireEvent.click(trigger)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('renders a custom value and marks invalid state', () => {
    renderWithTheme(
      <Select value={2} error renderValue={(value) => `#${String(value)}`}>
        {options}
      </Select>
    )
    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveTextContent('#2')
    expect(trigger).toHaveAttribute('aria-invalid', 'true')
  })

  it('emits a hidden input carrying the value for form submission', () => {
    const { container, rerender } = renderWithTheme(
      <Select name="pick" value={2}>
        {options}
      </Select>
    )
    expect(container.querySelector('input[name="pick"]')).toHaveValue('2')

    rerender(
      <Select name="pick" multiple value={[1, 3]}>
        {options}
      </Select>
    )
    expect(container.querySelector('input[name="pick"]')).toHaveValue('1,3')
  })

  it('ignores Home/End/Escape and blur while closed', () => {
    renderWithTheme(<Select>{options}</Select>)
    const trigger = screen.getByRole('combobox')
    fireEvent.keyDown(trigger, { key: 'Home' })
    fireEvent.keyDown(trigger, { key: 'End' })
    fireEvent.keyDown(trigger, { key: 'Escape' })
    fireEvent.blur(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('keeps the trigger focused when the listbox is pressed', () => {
    renderWithTheme(<Select>{options}</Select>)
    openMenu()
    const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
    fireEvent(screen.getByRole('listbox'), event)
    expect(event.defaultPrevented).toBe(true)
  })

  it('applies visual props without leaking them to the DOM', () => {
    renderWithTheme(
      <Select
        variant="outlined"
        borderRadius="md"
        fullWidth
        color="secondary"
        textColor="secondary"
        iconName="expand_more"
        size="lg"
      >
        {options}
      </Select>
    )
    const trigger = screen.getByRole('combobox')
    expect(trigger).not.toHaveAttribute('borderRadius')
    expect(trigger).not.toHaveAttribute('fullWidth')
  })

  it("lets a MenuItem's own color/textColor override the values from Select", () => {
    renderWithTheme(
      // `value=3` sends the highlight to the last row, so the two under test stay in their base state.
      <Select textColor="secondary" value={3} onChange={() => {}}>
        <MenuItem value={1}>Inherits</MenuItem>
        <MenuItem value={2} color="error" textColor="error">
          Overrides
        </MenuItem>
        <MenuItem value={3}>Selected</MenuItem>
      </Select>
    )
    openMenu()
    expect(screen.getByRole('option', { name: 'Inherits' })).toHaveStyle({
      color: dark.text.secondary,
    })
    expect(screen.getByRole('option', { name: 'Overrides' })).toHaveStyle({
      color: dark.text.error,
    })
  })

  it('renders the text variant without a background', () => {
    const { rerender } = renderWithTheme(<Select variant="text">{options}</Select>)
    expect(screen.getByRole('combobox')).toHaveStyle({ backgroundColor: 'rgba(0, 0, 0, 0)' })
    rerender(
      <Select variant="default" bg="paper">
        {options}
      </Select>
    )
    expect(screen.getByRole('combobox')).toHaveStyle({ backgroundColor: dark.background.paper })
  })

  it('applies its borderRadius to the popover surface', () => {
    renderWithTheme(<Select borderRadius="md">{options}</Select>)
    openMenu()
    expect(screen.getByRole('listbox').parentElement!).toHaveStyle({ borderRadius: dark.radii.md })
  })

  it('applies its bg to the popover surface (Paper), not the rows', () => {
    renderWithTheme(<Select bg="secondary">{options}</Select>)
    openMenu()
    const paper = screen.getByRole('listbox').parentElement!
    expect(paper).toHaveStyle({ backgroundColor: dark.background.secondary })
  })

  it('preserves a MenuItem divider inside the listbox', () => {
    renderWithTheme(
      <Select>
        <MenuItem value={1} divider>
          One
        </MenuItem>
        <MenuItem value={2}>Two</MenuItem>
      </Select>
    )
    openMenu()
    expect(screen.getByRole('option', { name: 'One' })).toHaveStyle({
      borderBottomStyle: 'solid',
      borderBottomColor: dark.border.light,
    })
    expect(screen.getByRole('option', { name: 'Two' })).not.toHaveStyle({
      borderBottomStyle: 'solid',
    })
  })

  it('renders non-option children alongside the options', () => {
    renderWithTheme(
      <Select>
        <li aria-hidden>Group label</li>
        <MenuItem value={1}>One</MenuItem>
      </Select>
    )
    openMenu()
    expect(screen.getByText('Group label')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'One' })).toBeInTheDocument()
  })
})
