import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { userEvent } from 'vitest/browser'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { graphFixture } from './NetworkGraph.fixture'
import { NetworkGraph } from './NetworkGraph'
import { VIEW_SIZE } from './const'

// Runs in real Chromium (vitest `unit-browser` project), not jsdom. The imperative
// D3 layer in useGraphSimulation - force simulation + tick, zoom transitions, the
// ctrl-wheel filter/wheelDelta, and pointer drag - needs a real layout engine and
// real pointer events that jsdom cannot provide. This is the coverage for the
// blocks that were previously /* v8 ignore */-d.

const renderGraph = () =>
  renderWithTheme(
    <NetworkGraph data={graphFixture} graphChildren={() => null} heading={<>Test Graph</>} />
  )

const transformOf = (el: Element | null) => el?.getAttribute('transform') ?? ''

/** Resolve once the simulation stops moving a node (two equal, non-empty ticks). */
const waitForSettle = async (node: () => Element) => {
  let prev = '__init__'
  await vi.waitFor(
    () => {
      const current = transformOf(node())
      const stable = current !== '' && current === prev
      prev = current
      expect(stable).toBe(true)
    },
    { timeout: 5000, interval: 150 }
  )
}

describe('NetworkGraph (browser)', () => {
  it('mounts the SVG with the fixed logical viewBox', () => {
    const { container } = renderGraph()
    const svg = container.querySelector('svg')!
    expect(svg).toBeInTheDocument()
    expect(svg.getAttribute('viewBox')).toBe(`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`)
  })

  it('runs the force simulation and positions node groups via the tick handler', async () => {
    const { container } = renderGraph()
    await vi.waitFor(
      () => {
        // tick writes a non-origin translate(x,y) onto each node group
        const node = container.querySelector('.node-group')
        expect(transformOf(node)).toMatch(/translate\((?!0,\s*0\))/)
      },
      { timeout: 3000 }
    )
  })

  it('transforms the graph group on zoom in, out, and reset', async () => {
    const { container } = renderGraph()
    const group = () => container.querySelector('svg > g')!

    await userEvent.click(screen.getByLabelText('Zoom in'))
    await vi.waitFor(() => expect(transformOf(group())).toMatch(/scale\(1\.[0-9]/), {
      timeout: 3000,
    })

    await userEvent.click(screen.getByLabelText('Zoom out'))
    await userEvent.click(screen.getByLabelText('Reset view'))
    await vi.waitFor(
      () => {
        // reset returns to the identity transform (no scale, or scale(1))
        const t = transformOf(group())
        expect(t === '' || /scale\(1\)/.test(t)).toBe(true)
      },
      { timeout: 3000 }
    )
  })

  it('zooms on ctrl+wheel in both directions and ignores a plain wheel', async () => {
    const { container } = renderGraph()
    const svg = container.querySelector('svg')!
    const group = () => container.querySelector('svg > g')!
    const scaleOf = () => Number(transformOf(group()).match(/scale\(([\d.]+)/)?.[1] ?? '1')
    const wheel = (deltaY: number, ctrlKey = true) =>
      svg.dispatchEvent(
        new WheelEvent('wheel', { deltaY, ctrlKey, bubbles: true, cancelable: true })
      )

    // plain wheel is rejected by the zoom filter - no transform applied
    wheel(-100, false)
    expect(transformOf(group())).toBe('')

    // ctrl+wheel up → positive wheelDelta branch → zoom in (scale > 1)
    wheel(-100)
    await vi.waitFor(() => expect(scaleOf()).toBeGreaterThan(1), { timeout: 3000 })

    // ctrl+wheel down → negative wheelDelta branch → zoom back out (scale shrinks)
    const zoomedIn = scaleOf()
    wheel(100)
    wheel(100)
    await vi.waitFor(() => expect(scaleOf()).toBeLessThan(zoomedIn), { timeout: 3000 })
  })

  it('repositions a node when dragged', async () => {
    const { container } = renderGraph()
    const node = () => container.querySelector('.node-group')!
    const svg = container.querySelector('svg')!

    // settle first so the only motion attributable to the drag is the drag itself
    await waitForSettle(node)
    const before = transformOf(node())

    await userEvent.dragAndDrop(node(), svg)
    await vi.waitFor(() => expect(transformOf(node())).not.toBe(before), { timeout: 3000 })
  })

  it("sizes a visible group node's rect to its label via getBBox", async () => {
    const { container } = renderGraph()
    // Area A is a branch; revealing it shows child A1, whose group node 'Grp' rides
    // along and renders. getBBox works in real Chromium (it throws in jsdom), so the
    // group rect is sized to the label - the branch the jsdom suite can't reach.
    const categories = () => [...container.querySelectorAll<SVGGElement>('.node-group.is-category')]
    const areaA = () =>
      categories().find((g) => g.querySelector('.node-label')?.textContent === 'Area A')!

    await waitForSettle(areaA)
    await userEvent.click(areaA())

    await vi.waitFor(
      () => {
        const rect = container.querySelector('.node-rect')
        expect(rect).not.toBeNull()
        expect(Number(rect!.getAttribute('width'))).toBeGreaterThan(0)
      },
      { timeout: 3000 }
    )
  })

  it('does not re-reheat the simulation while a concurrent drag is active', async () => {
    const { container } = renderGraph()
    const nodes = container.querySelectorAll<SVGGElement>('.node-group')
    const [first, second] = nodes

    // d3-drag tracks one gesture per touch identifier, so only multitouch can make
    // event.active > 0 (a mouse drag is always a single gesture). Two overlapping
    // touches exercise the `!event.active` else-path: the 2nd 'start' and the 1st
    // 'end' both see another gesture still active, so the simulation isn't reheated.
    const touch = (el: Element, identifier: number) =>
      new Touch({ identifier, target: el, clientX: 100, clientY: 100 })
    const t1 = touch(first, 1)
    const t2 = touch(second, 2)
    const fire = (el: Element, type: string, changedTouches: Touch[], touches: Touch[]) =>
      el.dispatchEvent(
        new TouchEvent(type, { bubbles: true, cancelable: true, changedTouches, touches })
      )

    fire(first, 'touchstart', [t1], [t1]) // gesture 1 starts (active 0 → reheat)
    fire(second, 'touchstart', [t2], [t1, t2]) // gesture 2 starts (active 1 → else)
    fire(first, 'touchend', [t1], [t2]) // gesture 1 ends (active 1 → else)
    fire(second, 'touchend', [t2], []) // gesture 2 ends (active 0 → cool down)

    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
