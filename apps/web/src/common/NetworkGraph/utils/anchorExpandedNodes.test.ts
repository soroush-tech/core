import { describe, it, expect } from 'vitest'
import { anchorExpandedNodes } from './anchorExpandedNodes'

describe('anchorExpandedNodes', () => {
  it('captures the settled position of an expanded node', () => {
    const positions = new Map([['A', { x: 5, y: 6 }]])
    const anchors = new Map<string, { x: number; y: number }>()
    anchorExpandedNodes(new Set(['A']), positions, anchors)
    expect(anchors.get('A')).toEqual({ x: 5, y: 6 })
  })

  it('skips an expanded node that has no settled position yet', () => {
    const anchors = new Map<string, { x: number; y: number }>()
    anchorExpandedNodes(new Set(['A']), new Map(), anchors)
    expect(anchors.has('A')).toBe(false)
  })

  it('captures once - keeps the original spot even after the node moves', () => {
    const positions = new Map([['A', { x: 5, y: 6 }]])
    const anchors = new Map<string, { x: number; y: number }>()
    anchorExpandedNodes(new Set(['A']), positions, anchors)
    positions.set('A', { x: 99, y: 99 })
    anchorExpandedNodes(new Set(['A']), positions, anchors)
    expect(anchors.get('A')).toEqual({ x: 5, y: 6 })
  })

  it('drops the anchor when a node is no longer expanded', () => {
    const anchors = new Map([['A', { x: 5, y: 6 }]])
    anchorExpandedNodes(new Set(), new Map(), anchors)
    expect(anchors.has('A')).toBe(false)
  })
})
