import { fireEvent, screen, within } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { renderWithTheme } from 'src/test/utils/wrapper'
import { graphFixture } from 'src/common/NetworkGraph/NetworkGraph.fixture'
import { GraphLegend } from './GraphLegend'

const { topLevelIds, titleById, childrenByParent } = graphFixture
const titleOf = (id: string) => titleById.get(id) ?? id
const firstChildOf = (id: string) => childrenByParent.get(id)![0]
// A leaf renders its label inside a row that has no checkbox input.
const inputFor = (title: string) =>
  screen.getByText(title).closest('label')?.querySelector('input') ?? null
// The clickable row (category or branch) that owns a given label. It is a div
// carrying button semantics - a native <button> may not contain the Flex divs
// these rows are built from.
const rowOf = (title: string) => screen.getByText(title).closest('[role="button"]')!

const baseProps: React.ComponentProps<typeof GraphLegend> = {
  topLevelIds,
  titleById,
  childrenByParent,
  optionalIds: new Set(),
  areasByNode: new Map(),
  expandedNodes: new Set(),
  onToggle: () => {},
  hasOptional: false,
  showOptional: false,
  onToggleOptional: () => {},
}

const legend = (props: Partial<React.ComponentProps<typeof GraphLegend>> = {}) => (
  <GraphLegend {...baseProps} {...props} />
)
const renderLegend = (props: Partial<React.ComponentProps<typeof GraphLegend>> = {}) =>
  renderWithTheme(legend(props))

// A child that is itself a branch needs a grandchild the fixture doesn't have.
const withBranchChild = {
  topLevelIds: ['P'],
  childrenByParent: new Map([
    ['P', ['c1']],
    ['c1', ['g1']],
  ]),
  titleById: new Map([
    ['P', 'Parent'],
    ['c1', 'Child 1'],
    ['g1', 'Grandchild 1'],
  ]),
}

// React is shared by Web and Mobile; React Native gates to Mobile only, so it must
// appear under Mobile's subtree but not Web's.
const withSharedChild = {
  topLevelIds: ['web', 'mobile'],
  childrenByParent: new Map([
    ['web', ['react']],
    ['mobile', ['react']],
    ['react', ['rn', 'redux']],
  ]),
  titleById: new Map([
    ['web', 'Web'],
    ['mobile', 'Mobile'],
    ['react', 'React'],
    ['rn', 'React Native'],
    ['redux', 'Redux'],
  ]),
  areasByNode: new Map([
    ['react', ['web', 'mobile']],
    ['rn', ['mobile']],
    ['redux', ['web', 'mobile']],
  ]),
}

// A category with one legacy child and one regular child, to test menu filtering.
const withLegacyChild = {
  topLevelIds: ['P'],
  childrenByParent: new Map([['P', ['keep', 'old']]]),
  titleById: new Map([
    ['P', 'Parent'],
    ['keep', 'Keep'],
    ['old', 'Legacy'],
  ]),
  optionalIds: new Set(['old']),
}

describe('GraphLegend', () => {
  it('renders the legend with every top-level category (by title)', () => {
    renderLegend()
    expect(screen.getByText('CATEGORIES')).toBeInTheDocument()
    for (const id of topLevelIds) expect(screen.getByText(titleOf(id))).toBeInTheDocument()
  })

  it('calls onToggle with the category id when its row is clicked', () => {
    const onToggle = vi.fn()
    renderLegend({ onToggle })
    fireEvent.click(screen.getByText(titleOf(topLevelIds[0])))
    expect(onToggle).toHaveBeenCalledWith(topLevelIds[0])
  })

  it('exposes every expandable row as a keyboard-reachable button', () => {
    renderLegend({ ...withBranchChild, expandedNodes: new Set(['P']) })
    // Category and branch rows tab and answer Enter/Space via Pressable, with no
    // hand-rolled role/tabIndex/onKeyDown of their own.
    for (const title of ['Parent', 'Child 1']) {
      expect(rowOf(title)).toHaveAttribute('tabindex', '0')
    }
    expect(screen.getAllByRole('button')).toHaveLength(2)
    // A leaf has nothing to expand, so it stays a plain, non-interactive row.
    expect(screen.getByText('Grandchild 1').closest('[role="button"]')).toBeNull()
  })

  it('activates an expandable row from the keyboard', () => {
    const onToggle = vi.fn()
    renderLegend({ ...withBranchChild, onToggle })
    fireEvent.keyDown(rowOf('Parent'), { key: 'Enter' })
    expect(onToggle).toHaveBeenCalledWith('P')
  })

  it("announces each expandable row's state via aria-expanded", () => {
    const { rerender } = renderLegend({ ...withBranchChild })
    expect(rowOf('Parent')).toHaveAttribute('aria-expanded', 'false')

    rerender(legend({ ...withBranchChild, expandedNodes: new Set(['P', 'c1']) }))
    expect(rowOf('Parent')).toHaveAttribute('aria-expanded', 'true')
    expect(rowOf('Child 1')).toHaveAttribute('aria-expanded', 'true')
  })

  it('shows + when a category is collapsed and - when expanded', () => {
    const { rerender } = renderLegend()
    // both categories collapsed → two "+", no "-"
    expect(screen.getAllByText('+')).toHaveLength(topLevelIds.length)
    expect(screen.queryByText('-')).not.toBeInTheDocument()

    rerender(legend({ expandedNodes: new Set([topLevelIds[0]]) }))
    // the expanded category now shows "-"; the other stays "+"
    expect(screen.getByText('-')).toBeInTheDocument()
    expect(screen.getAllByText('+')).toHaveLength(topLevelIds.length - 1)
  })

  it("reveals a category's children only once it is expanded", () => {
    // Children are always rendered; the list collapses via its data-open flag.
    const child = firstChildOf(topLevelIds[0])
    const listOf = (title: string) => screen.getByText(title).closest('[data-open]')
    const { rerender } = renderLegend()
    expect(listOf(titleOf(child))).toHaveAttribute('data-open', 'false')

    rerender(legend({ expandedNodes: new Set([topLevelIds[0]]) }))
    expect(listOf(titleOf(child))).toHaveAttribute('data-open', 'true')
  })

  it('renders an empty list for an expanded category that has none', () => {
    // topLevelIds[1] (B) is absent from childrenByParent - its opened list has no rows.
    renderLegend({ expandedNodes: new Set([topLevelIds[1]]) })
    const list = rowOf(titleOf(topLevelIds[1])).nextElementSibling
    expect(list).toHaveAttribute('data-open', 'true')
    expect(list).toHaveTextContent('')
  })

  it('renders a leaf child as a label with no checkbox', () => {
    // A1 is a leaf (absent from childrenByParent), so it gets a dash, not a checkbox.
    const leaf = firstChildOf(topLevelIds[0])
    renderLegend({ expandedNodes: new Set([topLevelIds[0]]) })
    expect(screen.getByText(titleOf(leaf))).toBeInTheDocument()
    expect(inputFor(titleOf(leaf))).toBeNull()
  })

  it('renders a branch child as a caret row reflecting its expanded state', () => {
    const { rerender } = renderLegend({ ...withBranchChild, expandedNodes: new Set(['P']) })
    // Collapsed branch child shows "+" and hides its grandchild's list.
    expect(within(rowOf('Child 1')).getByText('+')).toBeInTheDocument()

    rerender(legend({ ...withBranchChild, expandedNodes: new Set(['P', 'c1']) }))
    expect(within(rowOf('Child 1')).getByText('-')).toBeInTheDocument()
    expect(screen.getByText('Grandchild 1')).toBeInTheDocument()
  })

  it('toggles a branch child via its row', () => {
    const onToggle = vi.fn()
    renderLegend({ ...withBranchChild, expandedNodes: new Set(['P']), onToggle })
    fireEvent.click(rowOf('Child 1'))
    expect(onToggle).toHaveBeenCalledWith('c1')
  })

  it('keeps a shared child only under the area it gates to', () => {
    renderLegend({ ...withSharedChild, expandedNodes: new Set(['web', 'mobile', 'react']) })
    // Each category's child list is the row's next sibling.
    const subtree = (area: string) => rowOf(area).nextElementSibling as HTMLElement
    // React is shared, so it shows under both areas.
    expect(within(subtree('Web')).getByText('React')).toBeInTheDocument()
    expect(within(subtree('Mobile')).getByText('React')).toBeInTheDocument()
    // React Native gates to Mobile only - present there, absent under Web.
    expect(within(subtree('Mobile')).getByText('React Native')).toBeInTheDocument()
    expect(within(subtree('Web')).queryByText('React Native')).not.toBeInTheDocument()
    // Redux gates to both, so it still appears under Web.
    expect(within(subtree('Web')).getByText('Redux')).toBeInTheDocument()
  })

  it('hides legacy children from the menu while the legacy switch is off', () => {
    renderLegend({ ...withLegacyChild, expandedNodes: new Set(['P']), hasOptional: true })
    expect(screen.getByText('Keep')).toBeInTheDocument()
    expect(screen.queryByText('Legacy')).not.toBeInTheDocument()
  })

  it('shows legacy children once the legacy switch is on', () => {
    renderLegend({
      ...withLegacyChild,
      expandedNodes: new Set(['P']),
      hasOptional: true,
      showOptional: true,
    })
    expect(screen.getByText('Legacy')).toBeInTheDocument()
  })

  it('hides the legacy switch when the graph has no optional nodes', () => {
    renderLegend({ hasOptional: false })
    expect(screen.queryByText('Show legacy')).not.toBeInTheDocument()
  })

  it('shows the legacy switch and reflects showOptional when there are optional nodes', () => {
    renderLegend({ hasOptional: true, showOptional: true })
    expect((screen.getByRole('switch') as HTMLInputElement).checked).toBe(true)
  })

  it('calls onToggleOptional when the legacy switch is clicked', () => {
    const onToggleOptional = vi.fn()
    renderLegend({ hasOptional: true, onToggleOptional })
    fireEvent.click(screen.getByRole('switch'))
    expect(onToggleOptional).toHaveBeenCalled()
  })
})
