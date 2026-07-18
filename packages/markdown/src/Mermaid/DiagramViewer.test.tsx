import { describe, it, expect } from 'vitest'
import { fireEvent, screen, within } from '@testing-library/react'
import { renderWithTheme } from '@soroush.tech/design-system/utils/test/renderWithTheme'
import { DiagramViewer } from './DiagramViewer'

const SVG = '<svg data-testid="svg"></svg>'
const transform = () => screen.getByTestId('diagram-transform').style.transform
const surface = () => screen.getByTestId('diagram-transform').parentElement as HTMLElement

describe('DiagramViewer', () => {
  it('renders the diagram at 1x with no offset', () => {
    renderWithTheme(<DiagramViewer svg={SVG} />)
    expect(screen.getByTestId('svg')).toBeInTheDocument()
    expect(transform()).toBe('translate(0px, 0px) scale(1)')
  })

  it('zooms in and out with the buttons', () => {
    renderWithTheme(<DiagramViewer svg={SVG} />)
    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }))
    expect(transform()).toContain('scale(1.2)')
    fireEvent.click(screen.getByRole('button', { name: 'Zoom out' }))
    expect(transform()).toContain('scale(1)')
  })

  it('clamps zoom between the min and max', () => {
    renderWithTheme(<DiagramViewer svg={SVG} />)
    const zoomIn = screen.getByRole('button', { name: 'Zoom in' })
    for (let i = 0; i < 40; i++) fireEvent.click(zoomIn)
    expect(transform()).toContain('scale(5)')
    const zoomOut = screen.getByRole('button', { name: 'Zoom out' })
    for (let i = 0; i < 60; i++) fireEvent.click(zoomOut)
    expect(transform()).toContain('scale(0.2)')
  })

  it('zooms with the wheel in both directions when fullscreen', () => {
    renderWithTheme(<DiagramViewer svg={SVG} fill />)
    fireEvent.wheel(surface(), { deltaY: -1 })
    expect(transform()).toContain('scale(1.2)')
    fireEvent.wheel(surface(), { deltaY: 1 })
    expect(transform()).toContain('scale(1)')
  })

  it('does not zoom on wheel when inline — the page scrolls instead', () => {
    renderWithTheme(<DiagramViewer svg={SVG} />)
    fireEvent.wheel(surface(), { deltaY: -1 })
    expect(transform()).toContain('scale(1)')
  })

  it('pans in each direction with the arrow buttons', () => {
    renderWithTheme(<DiagramViewer svg={SVG} />)
    fireEvent.click(screen.getByRole('button', { name: 'Pan right' }))
    expect(transform()).toContain('translate(48px, 0px)')
    fireEvent.click(screen.getByRole('button', { name: 'Pan down' }))
    expect(transform()).toContain('translate(48px, 48px)')
    fireEvent.click(screen.getByRole('button', { name: 'Pan left' }))
    expect(transform()).toContain('translate(0px, 48px)')
    fireEvent.click(screen.getByRole('button', { name: 'Pan up' }))
    expect(transform()).toContain('translate(0px, 0px)')
  })

  it('pans by dragging', () => {
    renderWithTheme(<DiagramViewer svg={SVG} />)
    fireEvent.mouseDown(surface(), { clientX: 10, clientY: 20 })
    fireEvent.mouseMove(surface(), { clientX: 40, clientY: 55 })
    expect(transform()).toContain('translate(30px, 35px)')
    fireEvent.mouseUp(surface())
  })

  it('ignores movement when not dragging', () => {
    renderWithTheme(<DiagramViewer svg={SVG} />)
    fireEvent.mouseMove(surface(), { clientX: 40, clientY: 55 })
    expect(transform()).toContain('translate(0px, 0px)')
  })

  it('resets zoom and pan', () => {
    renderWithTheme(<DiagramViewer svg={SVG} />)
    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }))
    fireEvent.mouseDown(surface(), { clientX: 0, clientY: 0 })
    fireEvent.mouseMove(surface(), { clientX: 25, clientY: 25 })
    fireEvent.click(screen.getByRole('button', { name: 'Reset view' }))
    expect(transform()).toBe('translate(0px, 0px) scale(1)')
  })

  it('opens the diagram in a fullscreen dialog and closes it', () => {
    renderWithTheme(<DiagramViewer svg={SVG} />)
    expect(screen.queryByRole('dialog')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Expand diagram' }))
    const dialog = screen.getByRole('dialog')
    // The nested viewer inside the dialog renders the same diagram, without its own expand button.
    expect(within(dialog).getByTestId('svg')).toBeInTheDocument()
    expect(within(dialog).queryByRole('button', { name: 'Expand diagram' })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('ends the drag on mouse leave', () => {
    renderWithTheme(<DiagramViewer svg={SVG} />)
    fireEvent.mouseDown(surface(), { clientX: 0, clientY: 0 })
    fireEvent.mouseLeave(surface())
    fireEvent.mouseMove(surface(), { clientX: 50, clientY: 50 })
    expect(transform()).toContain('translate(0px, 0px)')
  })
})
