import { describe, it, expect, vi } from 'vitest'
import { createRef } from 'react'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithTheme } from '../utils/test/renderWithTheme'
import { baseTheme } from '../theme/themes'
import { Popover, type PopoverActions } from './Popover'

function makeAnchor() {
  const anchor = document.createElement('button')
  anchor.getBoundingClientRect = () =>
    ({ top: 100, left: 40, width: 120, height: 30, bottom: 130, right: 160 }) as DOMRect
  document.body.appendChild(anchor)
  return anchor
}

describe('Popover', () => {
  it('renders nothing while closed', () => {
    renderWithTheme(
      <Popover open={false} anchorEl={makeAnchor()}>
        <p>Panel</p>
      </Popover>
    )
    expect(screen.queryByText('Panel')).not.toBeInTheDocument()
  })

  it('portals the content and positions the surface when open', () => {
    renderWithTheme(
      <Popover
        open
        anchorEl={makeAnchor()}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <p>Panel</p>
      </Popover>
    )
    const panel = screen.getByText('Panel')
    expect(panel).toBeInTheDocument()
    // The positioned wrapper (grandparent of the content) carries the computed offset.
    const positioner = panel.parentElement!.parentElement as HTMLElement
    expect(positioner.style.top).toBe('130px')
    expect(positioner.style.left).toBe('40px')
  })

  it('closes on Escape via the underlying Modal', () => {
    const onClose = vi.fn()
    renderWithTheme(
      <Popover open anchorEl={makeAnchor()} onClose={onClose}>
        <p>Panel</p>
      </Popover>
    )
    fireEvent.keyDown(screen.getByText('Panel'), { key: 'Escape' })
    expect(onClose).toHaveBeenCalledWith(expect.anything(), 'escapeKey')
  })

  it('closes on a click outside the surface (Modal root)', () => {
    const onClose = vi.fn()
    renderWithTheme(
      <Popover open anchorEl={makeAnchor()} onClose={onClose}>
        <p>Panel</p>
      </Popover>
    )
    const root = screen.getByRole('presentation')
    fireEvent.click(root)
    expect(onClose).toHaveBeenCalledWith(expect.anything(), 'backdropClick')
  })

  it('applies elevation and paper slot props to the surface', () => {
    renderWithTheme(
      <Popover open anchorEl={makeAnchor()} slotProps={{ paper: { bg: 'secondary' } }}>
        <p>Panel</p>
      </Popover>
    )
    const surface = screen.getByText('Panel').parentElement as HTMLElement
    expect(surface).toHaveStyle({ backgroundColor: baseTheme.background.secondary })
  })

  it('positions from anchorPosition and re-positions on resize', () => {
    renderWithTheme(
      <Popover open anchorReference="anchorPosition" anchorPosition={{ top: 200, left: 300 }}>
        <p>Panel</p>
      </Popover>
    )
    const positioner = screen.getByText('Panel').parentElement!.parentElement as HTMLElement
    expect(positioner.style.top).toBe('200px')
    fireEvent(window, new Event('resize'))
    expect(positioner.style.top).toBe('200px')
  })

  it('re-positions on scroll when scroll lock is disabled', () => {
    renderWithTheme(
      <Popover
        open
        disableScrollLock
        anchorReference="anchorPosition"
        anchorPosition={{ top: 10, left: 10 }}
      >
        <p>Panel</p>
      </Popover>
    )
    fireEvent(window, new Event('scroll'))
    expect(screen.getByText('Panel')).toBeInTheDocument()
  })

  it('positions without clamping when marginThreshold is null', () => {
    renderWithTheme(
      <Popover open marginThreshold={null} anchorEl={makeAnchor()}>
        <p>Panel</p>
      </Popover>
    )
    expect(screen.getByText('Panel')).toBeInTheDocument()
  })

  it('leaves coordinates unset for anchorReference "none"', () => {
    renderWithTheme(
      <Popover open anchorReference="none">
        <p>Panel</p>
      </Popover>
    )
    const positioner = screen.getByText('Panel').parentElement!.parentElement as HTMLElement
    expect(positioner.style.top).toBe('')
    expect(positioner.style.left).toBe('')
    expect(positioner.style.transformOrigin).toBe('0px 0px')
  })

  it('exposes an updatePosition action that no-ops while closed', () => {
    const action = createRef<PopoverActions>()
    renderWithTheme(
      <Popover open={false} action={action} anchorEl={makeAnchor()}>
        <p>Panel</p>
      </Popover>
    )
    expect(() => action.current?.updatePosition()).not.toThrow()
  })
})
