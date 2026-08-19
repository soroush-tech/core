import { describe, it, expect } from 'vitest'
import { computeVisibleIds } from './computeVisibleIds'

const ROOT_ID = 'ROOT'

describe('computeVisibleIds', () => {
  // roots A,B; A→C and B→C (C is shared), C→D
  const adjacency = new Map<string, string[]>([
    ['A', ['C']],
    ['B', ['C']],
    ['C', ['D']],
  ])
  const roots = ['A', 'B']

  it('shows only root and the top-level roots when nothing is expanded', () => {
    const ids = computeVisibleIds(new Set(), ROOT_ID, adjacency, roots)
    expect([...ids].sort()).toEqual([ROOT_ID, 'A', 'B'].sort())
  })

  it("reveals a branch's children only when it is expanded", () => {
    const ids = computeVisibleIds(new Set(['A']), ROOT_ID, adjacency, roots)
    expect(ids.has('C')).toBe(true)
    expect(ids.has('D')).toBe(false) // C itself is not expanded
  })

  it('recurses into nested expanded branches', () => {
    const ids = computeVisibleIds(new Set(['A', 'C']), ROOT_ID, adjacency, roots)
    expect(ids.has('D')).toBe(true)
  })

  it('visits a shared child once when both parents are expanded', () => {
    const ids = computeVisibleIds(new Set(['A', 'B']), ROOT_ID, adjacency, roots)
    expect(ids.has('C')).toBe(true)
  })

  it('handles an expanded node with no children entry', () => {
    const ids = computeVisibleIds(new Set(['A', 'D']), ROOT_ID, new Map([['A', ['D']]]), ['A'])
    expect(ids.has('D')).toBe(true)
  })

  it('omits hidden children even when their parent is expanded', () => {
    const ids = computeVisibleIds(new Set(['A']), ROOT_ID, adjacency, roots, new Set(['C']))
    expect(ids.has('C')).toBe(false)
  })

  it("hides a hidden branch's subtree (does not recurse through it)", () => {
    const ids = computeVisibleIds(new Set(['A', 'C']), ROOT_ID, adjacency, roots, new Set(['C']))
    expect(ids.has('C')).toBe(false)
    expect(ids.has('D')).toBe(false)
  })

  it('drops a hidden top-level root from the visible set', () => {
    const ids = computeVisibleIds(new Set(), ROOT_ID, adjacency, roots, new Set(['B']))
    expect(ids.has('B')).toBe(false)
    expect(ids.has('A')).toBe(true)
  })

  describe('gated mode (area membership)', () => {
    // areas A,B; A→C→D and B→C. C lives in both areas, D only in A.
    const tree = new Map<string, string[]>([
      ['A', ['C']],
      ['B', ['C']],
      ['C', ['D']],
    ])
    const gate = new Map<string, string[]>([
      ['C', ['A', 'B']],
      ['D', ['A']],
    ])

    it('shows every area as a hub but no children until one is activated', () => {
      const ids = computeVisibleIds(new Set(), ROOT_ID, tree, roots, new Set(), gate)
      expect([...ids].sort()).toEqual(['A', 'B']) // both area hubs, no children, no root
    })

    it('activating an area reveals its direct children; deeper needs expanding', () => {
      const ids = computeVisibleIds(new Set(['A']), ROOT_ID, tree, roots, new Set(), gate)
      expect(ids.has('A')).toBe(true)
      expect(ids.has('B')).toBe(true) // inactive area hub still shown
      expect(ids.has('C')).toBe(true) // direct child, gate ∋ A
      expect(ids.has('D')).toBe(false) // C not expanded yet
    })

    it('expanding a branch within an active area reveals its children', () => {
      const ids = computeVisibleIds(new Set(['A', 'C']), ROOT_ID, tree, roots, new Set(), gate)
      expect(ids.has('D')).toBe(true)
    })

    it('hides a node whose gate excludes every active area', () => {
      const ids = computeVisibleIds(new Set(['B', 'C']), ROOT_ID, tree, roots, new Set(), gate)
      expect(ids.has('C')).toBe(true) // gate ∋ B
      expect(ids.has('D')).toBe(false) // D is A-only, A is off
    })

    it('shows a central root alongside the hubs when the data has one', () => {
      const rooted = new Map<string, string[]>([[ROOT_ID, ['A', 'B']], ...tree])
      const ids = computeVisibleIds(new Set(), ROOT_ID, rooted, roots, new Set(), gate)
      expect([...ids].sort()).toEqual([ROOT_ID, 'A', 'B'].sort())
    })

    it('visits a shared child once when two active areas both reach it', () => {
      // A and B are both active and both list C - A adds C, then B skips the already-seen C.
      const ids = computeVisibleIds(new Set(['A', 'B']), ROOT_ID, tree, roots, new Set(), gate)
      expect(ids.has('C')).toBe(true)
    })

    it('skips a hidden child even within an active area', () => {
      const ids = computeVisibleIds(new Set(['A']), ROOT_ID, tree, roots, new Set(['C']), gate)
      expect(ids.has('C')).toBe(false)
    })

    it('handles an expanded gated node that has no children entry', () => {
      const ids = computeVisibleIds(
        new Set(['A', 'C']),
        ROOT_ID,
        new Map([['A', ['C']]]), // C has no entry of its own
        ['A'],
        new Set(),
        new Map([['C', ['A']]])
      )
      expect(ids.has('C')).toBe(true)
    })
  })
})
