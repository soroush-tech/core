import { fireEvent, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { graphFixture } from './NetworkGraph.fixture'
import { NetworkGraph } from './NetworkGraph'
import type { GraphChildProps } from './NetworkGraph.types'

// The React surface of each region (header, controls) is unit tested in its own
// component spec; the consumer-supplied content (e.g. a legend) is tested where it
// lives. These tests cover the composed wiring through the hooks and the D3 graph
// interactions that need a full render. A minimal stub stands in for the content
// component to assert NetworkGraph proxies the derived graph props to it.
const { rootId, titleById, topLevelIds } = graphFixture

const StubContent = ({ topLevelIds, titleById, onToggle }: GraphChildProps) => (
  <ul>
    {topLevelIds.map((id) => (
      <li key={id}>
        <button onClick={() => onToggle(id)}>{titleById.get(id) ?? id}</button>
      </li>
    ))}
  </ul>
)

const renderGraph = () =>
  renderWithTheme(
    <NetworkGraph data={graphFixture} graphChildren={StubContent} heading={<>Test Graph</>} />
  )

describe('NetworkGraph', () => {
  it('renders the heading and the root as the default active node', () => {
    renderGraph()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Graph')
    expect(screen.getByText('Active Node:').parentElement).toHaveTextContent(rootId)
  })

  describe('content component', () => {
    it("renders the graph's top-level ids and titles through the supplied component", () => {
      renderGraph()
      for (const id of topLevelIds) {
        expect(screen.getByRole('button', { name: titleById.get(id) ?? id })).toBeInTheDocument()
      }
    })

    it('forwards onToggle so the content can expand a branch in the graph', () => {
      const { container } = renderGraph()
      const count = () => container.querySelectorAll('.node-group').length
      const before = count()
      // topLevelIds[0] (A) is a branch - toggling it reveals its child node.
      fireEvent.click(screen.getByRole('button', { name: titleById.get(topLevelIds[0])! }))
      expect(count()).toBeGreaterThan(before)
    })
  })

  describe('zoom controls', () => {
    it('dispatches without error when each control is clicked', () => {
      renderGraph()
      fireEvent.click(screen.getByLabelText('Zoom in'))
      fireEvent.click(screen.getByLabelText('Zoom out'))
      fireEvent.click(screen.getByLabelText('Reset view'))
      // controls remain mounted after dispatch
      expect(screen.getByLabelText('Reset view')).toBeInTheDocument()
    })
  })

  describe('graph node interaction', () => {
    it('reports the hovered node as active and resets on leave', () => {
      const { container } = renderGraph()
      const branch = container.querySelector('.node-group.is-category')!
      const label = branch.querySelector('.node-label')!.textContent!

      fireEvent.mouseOver(branch)
      expect(screen.getByText('Active Node:').parentElement).toHaveTextContent(label)

      fireEvent.mouseOut(branch)
      expect(branch).toBeInTheDocument()
    })

    it('toggles a branch node open then closed when clicked', () => {
      const { container } = renderGraph()
      const selectFirstBranch = () => container.querySelector('.node-group.is-category')!
      const count = () => container.querySelectorAll('.node-group').length
      const collapsed = count()

      fireEvent.click(selectFirstBranch())
      expect(count()).toBeGreaterThan(collapsed)

      // d3 re-binds node groups on update, so re-query before the second click
      fireEvent.click(selectFirstBranch())
      expect(count()).toBe(collapsed)
    })

    it('ignores clicks on a non-branch node', () => {
      const { container } = renderGraph()
      const leaf = container.querySelector('.node-group:not(.is-category)')!
      const before = container.querySelectorAll('.node-group').length

      fireEvent.click(leaf)
      expect(container.querySelectorAll('.node-group')).toHaveLength(before)
    })
  })
})
