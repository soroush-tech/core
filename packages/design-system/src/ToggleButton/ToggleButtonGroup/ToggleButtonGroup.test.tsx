import { describe, it, expect, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithTheme } from '../../utils/test/renderWithTheme'
import { ToggleButton } from '../ToggleButton'
import { ToggleButtonGroup } from './ToggleButtonGroup'

const renderGroup = (props: React.ComponentProps<typeof ToggleButtonGroup>) =>
  renderWithTheme(
    <ToggleButtonGroup aria-label="Platform" {...props}>
      <ToggleButton value="web">Web</ToggleButton>
      <ToggleButton value="android">Android</ToggleButton>
      <ToggleButton value="ios">iOS</ToggleButton>
    </ToggleButtonGroup>
  )

describe('ToggleButtonGroup', () => {
  it('renders a labelled group', () => {
    renderGroup({})
    expect(screen.getByRole('group', { name: 'Platform' })).toBeInTheDocument()
  })

  it('selects a single value when exclusive', () => {
    const onChange = vi.fn()
    renderGroup({ isExclusive: true, value: 'web', onChange })
    fireEvent.click(screen.getByRole('button', { name: 'Android' }))
    expect(onChange).toHaveBeenCalledWith('android')
  })

  it('deselects to null when the exclusive value is clicked again', () => {
    const onChange = vi.fn()
    renderGroup({ isExclusive: true, value: 'web', onChange })
    fireEvent.click(screen.getByRole('button', { name: 'Web' }))
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('toggles values in and out of the array when not exclusive', () => {
    const onChange = vi.fn()
    renderGroup({ value: ['web'], onChange })
    fireEvent.click(screen.getByRole('button', { name: 'Android' }))
    expect(onChange).toHaveBeenCalledWith(['web', 'android'])
    fireEvent.click(screen.getByRole('button', { name: 'Web' }))
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('starts from an empty array when no value is set in multiple mode', () => {
    const onChange = vi.fn()
    renderGroup({ onChange })
    fireEvent.click(screen.getByRole('button', { name: 'iOS' }))
    expect(onChange).toHaveBeenCalledWith(['ios'])
  })

  it('marks the matching children as pressed', () => {
    renderGroup({ value: ['web', 'ios'] })
    expect(screen.getByRole('button', { name: 'Web' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Android' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'iOS' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('stacks children vertically via orientation', () => {
    renderGroup({ orientation: 'vertical' })
    expect(screen.getByRole('group')).toHaveStyle({ flexDirection: 'column' })
  })

  it('lays out horizontally by default', () => {
    renderGroup({})
    expect(screen.getByRole('group')).toHaveStyle({ flexDirection: 'row' })
  })

  it('disables all children', () => {
    renderGroup({ disabled: true })
    screen.getAllByRole('button').forEach((button) => expect(button).toBeDisabled())
  })

  it('stretches to full width', () => {
    renderGroup({ fullWidth: true })
    expect(screen.getByRole('group')).toHaveStyle({ width: '100%' })
  })

  it('does not crash without an onChange handler', () => {
    renderGroup({ isExclusive: true, value: 'web' })
    fireEvent.click(screen.getByRole('button', { name: 'Android' }))
    expect(screen.getByRole('group')).toBeInTheDocument()
  })

  it('forwards HTML attributes without leaking custom props to the DOM', () => {
    renderGroup({ isExclusive: true, fullWidth: true, 'data-testid': 'group' })
    const group = screen.getByTestId('group')
    expect(group).not.toHaveAttribute('isExclusive')
    expect(group).not.toHaveAttribute('fullWidth')
    expect(group).not.toHaveAttribute('orientation')
  })
})
