import { describe, it, expect } from 'vitest'
import { buildGraph, type GraphInputNode } from './buildGraph'

const ROOT = 'ROOT'

describe('buildGraph', () => {
  const sample: GraphInputNode[] = [
    { id: 'WEB', title: 'Web', kind: 'area' },
    { id: 'MOBILE', title: 'Mobile', kind: 'area' },
    { id: 'DESKTOP', title: 'Desktop', kind: 'area' },
    { id: 'BACKEND', title: 'Back-end', kind: 'area' },
    { id: 'LANGUAGE', title: 'Language', kind: 'group' },
    { id: 'STORAGE', title: 'Storage', kind: 'group' },
    { id: 'NodeJs', kind: 'node', parent: ['BACKEND'] }, // area parent draws the line, gate [BACKEND]
    // million-dollar case: a Web area-parent line + a Node.js parent line, gate spans both
    { id: 'JavaScript', kind: 'node', parent: ['WEB', 'NodeJs'], groups: ['LANGUAGE'] },
    { id: 'TS', title: 'TypeScript', kind: 'node', parent: ['NodeJs'], groups: ['LANGUAGE'] }, // 2nd LANGUAGE member
    { id: 'React', kind: 'node', parent: ['WEB', 'MOBILE'], relations: ['RN'] },
    { id: 'RN', title: 'React Native', kind: 'node', parent: ['MOBILE'], relations: ['React'] },
    { id: 'Redux', kind: 'node', parent: ['React'] }, // no own area ⇒ inherits React's [WEB, MOBILE]
    { id: 'Sentry', kind: 'node', parent: ['React'], area: ['BACKEND'] }, // own area overrides
    { id: 'fs', kind: 'node', parent: ['MOBILE', 'BACKEND'], groups: ['STORAGE'] },
    { id: 'Enzyme', kind: 'node', parent: ['WEB'], groups: ['STORAGE'], legacy: true },
  ]
  const g = buildGraph(sample, ROOT)
  const ids = new Set(g.nodes.map((n) => n.id))
  const hasLink = (source: string, target: string, kind?: 'group' | 'relation') =>
    g.links.some((l) => l.source === source && l.target === target && l.kind === kind)

  it('produces no root node - areas are the top level', () => {
    expect(g.nodes.some((n) => n.id === ROOT)).toBe(false)
    expect(g.links.some((l) => l.source === ROOT)).toBe(false)
  })

  it('treats the root as a no-gate parent a node may hang off', () => {
    const r = buildGraph(
      [
        { id: 'WEB', kind: 'area' },
        { id: 'X', kind: 'node', parent: ['WEB', ROOT] },
      ],
      ROOT
    )
    expect(r.areasByNode.get('X')).toEqual(['WEB']) // the root contributes no gate
    expect(r.links).toContainEqual({ source: ROOT, target: 'X' })
    expect(r.nodes.some((n) => n.id === ROOT)).toBe(true)
  })

  it('materializes a pinned root when an area attaches to rootId', () => {
    const r = buildGraph(
      [
        { id: 'WEB', kind: 'area', parent: [ROOT] },
        { id: 'MOBILE', kind: 'area', parent: [ROOT] },
      ],
      ROOT
    )
    expect(r.nodes.find((n) => n.id === ROOT)).toMatchObject({ id: ROOT, size: 40 })
    expect(r.links).toContainEqual({ source: ROOT, target: 'WEB' })
    expect(r.childrenByParent.get(ROOT)).toEqual(['WEB', 'MOBILE'])
    expect(r.branchIds.has(ROOT)).toBe(false) // pinned centre, not a clickable category
  })

  it('lists the areas as top-level', () => {
    expect(g.topLevelIds).toEqual(['WEB', 'MOBILE', 'DESKTOP', 'BACKEND'])
  })

  it('draws a line to each parent - areas and nodes alike (one identity)', () => {
    expect([...ids].filter((id) => id === 'JavaScript')).toHaveLength(1)
    expect(hasLink('WEB', 'JavaScript')).toBe(true) // area-parent line
    expect(hasLink('NodeJs', 'JavaScript')).toBe(true) // node-parent line
    expect(hasLink('BACKEND', 'JavaScript')).toBe(false) // Back-end is reached via Node.js
  })

  it("draws a line to each of a multi-parent node's parents", () => {
    expect(hasLink('MOBILE', 'fs')).toBe(true)
    expect(hasLink('BACKEND', 'fs')).toBe(true)
  })

  it('draws no line for the gate-only area tag', () => {
    expect(hasLink('BACKEND', 'Sentry')).toBe(false) // Sentry is tagged BACKEND but drawn under React
    expect(hasLink('React', 'Sentry')).toBe(true)
  })

  it("gates a node by its parents' tags, overridden by its own area", () => {
    expect(g.areasByNode.get('JavaScript')?.sort()).toEqual(['BACKEND', 'WEB']) // WEB + NodeJs gate
    expect(g.areasByNode.get('fs')?.sort()).toEqual(['BACKEND', 'MOBILE'])
    expect(g.areasByNode.get('Redux')?.sort()).toEqual(['MOBILE', 'WEB']) // inherited from React
    expect(g.areasByNode.get('Sentry')).toEqual(['BACKEND']) // own area overrides React's gate
  })

  it('draws a group as a node with its own dotted group line', () => {
    expect(ids.has('LANGUAGE')).toBe(true)
    expect(hasLink('LANGUAGE', 'JavaScript', 'group')).toBe(true)
    expect(g.branchIds.has('LANGUAGE')).toBe(false)
    expect(g.childrenByParent.has('LANGUAGE')).toBe(false)
  })

  it('drops a group that labels only a single member', () => {
    const d = buildGraph(
      [
        { id: 'WEB', kind: 'area' },
        { id: 'G1', kind: 'group' },
        { id: 'Solo', kind: 'node', parent: ['WEB'], groups: ['G1'] },
      ],
      ROOT
    )
    expect(d.nodes.some((n) => n.id === 'G1')).toBe(false) // group not drawn
    expect(d.links.some((l) => l.source === 'G1')).toBe(false) // lone spoke dropped
    expect(d.nodes.some((n) => n.id === 'Solo')).toBe(true) // the member stays
  })

  it('emits relations as a separate lateral edge kind', () => {
    expect(hasLink('React', 'RN', 'relation')).toBe(true)
    expect(hasLink('RN', 'React', 'relation')).toBe(true)
  })

  it('marks containment parents as branches', () => {
    expect(g.branchIds.has('WEB')).toBe(true)
    expect(g.branchIds.has('NodeJs')).toBe(true)
    expect(g.branchIds.has('React')).toBe(true)
    expect(g.branchIds.has('Redux')).toBe(false) // leaf
  })

  it('applies the role-based size ladder', () => {
    const sizeOf = (id: string) => g.nodes.find((n) => n.id === id)?.size
    expect(sizeOf('WEB')).toBe(25)
    expect(sizeOf('LANGUAGE')).toBe(18)
    expect(sizeOf('JavaScript')).toBe(10)
  })

  it('honours an explicit size override', () => {
    const g2 = buildGraph([{ id: 'WEB', kind: 'area', size: 30 }], ROOT)
    expect(g2.nodes.find((n) => n.id === 'WEB')?.size).toBe(30)
  })

  it('collects legacy nodes into optionalIds', () => {
    expect([...g.optionalIds]).toEqual(['Enzyme'])
  })

  it('collects featured nodes into featuredIds', () => {
    const f = buildGraph(
      [
        { id: 'WEB', kind: 'area' },
        { id: 'React', kind: 'node', parent: ['WEB'], featured: true },
        { id: 'Vue', kind: 'node', parent: ['WEB'] },
      ],
      ROOT
    )
    expect([...f.featuredIds]).toEqual(['React'])
  })

  // ── Strict validation ──
  it('throws on a duplicate id', () => {
    expect(() =>
      buildGraph(
        [
          { id: 'WEB', kind: 'area' },
          { id: 'WEB', kind: 'area' },
        ],
        ROOT
      )
    ).toThrow(/Duplicate node id/)
  })

  it('throws on an id that collides with rootId', () => {
    expect(() => buildGraph([{ id: ROOT, kind: 'area' }], ROOT)).toThrow(/collides with rootId/)
  })

  it('throws on a node with no area, parent, or relation', () => {
    expect(() => buildGraph([{ id: 'X', kind: 'node' }], ROOT)).toThrow(
      /has no area, parent, or relation/
    )
  })

  it('allows a relation-anchored (floating) node - no parent, only relations', () => {
    const f = buildGraph(
      [
        { id: 'WEB', kind: 'area' },
        { id: 'React', kind: 'node', parent: ['WEB'] },
        { id: 'Storybook', kind: 'node', relations: ['React'] }, // no parent ⇒ floating
      ],
      ROOT
    )
    expect(f.relationAnchoredIds.has('Storybook')).toBe(true)
    expect(f.nodes.some((n) => n.id === 'Storybook')).toBe(true)
    // It draws its relation but has no containment edge, so it is no node's child.
    expect(f.links).toContainEqual({ source: 'Storybook', target: 'React', kind: 'relation' })
    expect([...f.childrenByParent.values()].flat()).not.toContain('Storybook')
  })

  it('still rejects a parentless node that has no relation to ride along', () => {
    // area but no parent and no relation ⇒ nothing can ever draw it.
    expect(() =>
      buildGraph(
        [
          { id: 'WEB', kind: 'area' },
          { id: 'X', kind: 'node', area: ['WEB'] },
        ],
        ROOT
      )
    ).toThrow(/not reachable from an area/)
  })

  it('terminates a parent cycle when computing the area gate', () => {
    // A↔B form a parent cycle but both reach WEB through A, so neither is unreachable.
    // Neither has its own area, so gateOf recurses into parents and must break the loop.
    const g2 = buildGraph(
      [
        { id: 'WEB', kind: 'area' },
        { id: 'A', kind: 'node', parent: ['WEB', 'B'] },
        { id: 'B', kind: 'node', parent: ['A'] },
      ],
      ROOT
    )
    expect(g2.areasByNode.get('A')).toEqual(['WEB']) // A reaches WEB directly
    expect(g2.areasByNode.get('B')).toEqual([]) // B only loops back to A ⇒ no gate
  })

  it('throws on an unknown area reference', () => {
    expect(() => buildGraph([{ id: 'X', kind: 'node', area: ['GHOST'] }], ROOT)).toThrow(
      /unknown area "GHOST"/
    )
  })

  it('throws when a non-area is listed in area', () => {
    expect(() =>
      buildGraph(
        [
          { id: 'G', kind: 'group' },
          { id: 'X', kind: 'node', area: ['G'] },
        ],
        ROOT
      )
    ).toThrow(/non-area "G" in area/)
  })

  it('allows an area as a parent - it draws the line and gates the child', () => {
    const a = buildGraph(
      [
        { id: 'WEB', kind: 'area' },
        { id: 'X', kind: 'node', parent: ['WEB'] },
      ],
      ROOT
    )
    expect(a.links).toContainEqual({ source: 'WEB', target: 'X' })
    expect(a.areasByNode.get('X')).toEqual(['WEB'])
  })

  it('throws on an unknown parent reference', () => {
    expect(() => buildGraph([{ id: 'X', kind: 'node', parent: ['GHOST'] }], ROOT)).toThrow(
      /unknown parent "GHOST"/
    )
  })

  it('throws on an unknown group reference', () => {
    expect(() =>
      buildGraph(
        [
          { id: 'WEB', kind: 'area' },
          { id: 'X', kind: 'node', parent: ['WEB'], groups: ['GHOST'] },
        ],
        ROOT
      )
    ).toThrow(/unknown group "GHOST"/)
  })

  it('throws when a group is used as a parent', () => {
    expect(() =>
      buildGraph(
        [
          { id: 'WEB', kind: 'area' },
          { id: 'G', kind: 'group' },
          { id: 'X', kind: 'node', area: ['WEB'], parent: ['G'] },
        ],
        ROOT
      )
    ).toThrow(/lists a group "G" as a parent/)
  })

  it('throws when an area is listed in groups', () => {
    expect(() =>
      buildGraph(
        [
          { id: 'WEB', kind: 'area' },
          { id: 'X', kind: 'node', area: ['WEB'], groups: ['WEB'] },
        ],
        ROOT
      )
    ).toThrow(/lists an area "WEB" in groups/)
  })

  it('throws on an unknown relation reference', () => {
    expect(() => buildGraph([{ id: 'WEB', kind: 'area', relations: ['GHOST'] }], ROOT)).toThrow(
      /unknown relation "GHOST"/
    )
  })

  it('throws on a self relation', () => {
    expect(() => buildGraph([{ id: 'WEB', kind: 'area', relations: ['WEB'] }], ROOT)).toThrow(
      /relates to itself/
    )
  })

  it('throws on a node not reachable from an area', () => {
    expect(() =>
      buildGraph(
        [
          { id: 'A', kind: 'node', parent: ['B'] },
          { id: 'B', kind: 'node', parent: ['A'] },
        ],
        ROOT
      )
    ).toThrow(/not reachable from an area/)
  })
})
