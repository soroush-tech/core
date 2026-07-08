import { describe, it, expect } from 'vitest'
import type { GraphNode } from '../NetworkGraph.types'
import { forceAreaSeparation } from './forceAreaSeparation'

const node = (id: string, x: number, y: number): GraphNode => ({
  id,
  title: id,
  group: 0,
  size: 10,
  x,
  y,
  vx: 0,
  vy: 0,
})

const opts = { radiusBase: 60, radiusPerChild: 10, sharedAllowance: 20, strength: 1 }

describe('forceAreaSeparation', () => {
  it('pushes two overcrowded area centres apart, symmetrically', () => {
    const w = node('W', 0, 0)
    const m = node('M', 100, 0) // R 60 + 60 = need 120 > dist 100 ⇒ overshoot 20
    const force = forceAreaSeparation(opts)
    force.config(['W', 'M'], new Map())
    force.initialize([w, m])

    force(1) // push = (20 / 100) / 2 = 0.1 → ±(dx 100 * 0.1)

    expect(w.vx).toBe(-10)
    expect(m.vx).toBe(10)
    expect(w.vy).toBe(0)
    expect(m.vy).toBe(0)
  })

  it('leaves areas whose circles already clear each other untouched', () => {
    const w = node('W', 0, 0)
    const m = node('M', 200, 0) // dist 200 ≥ need 120
    const force = forceAreaSeparation(opts)
    force.config(['W', 'M'], new Map())
    force.initialize([w, m])

    force(1)

    expect(w.vx).toBe(0)
    expect(m.vx).toBe(0)
  })

  it('lets the circles sit closer when the areas share a node', () => {
    const w = node('W', 0, 0)
    const m = node('M', 130, 0)
    const n = node('n', 0, 0) // shared: gates both W and M
    const force = forceAreaSeparation(opts)
    force.config(['W', 'M'], new Map([['n', ['W', 'M']]]))
    force.initialize([w, m, n])

    // R 70 + 70 = 140, minus 1 shared * 20 = need 120 < dist 130 ⇒ no push
    // (without the shared allowance, need 140 > 130 would have pushed them apart)
    force(1)

    expect(w.vx).toBe(0)
    expect(m.vx).toBe(0)
  })

  it('applies the shared allowance when the pair is already in key order', () => {
    // Ids in ascending order ('A' < 'B') take pairKey's other ordering branch;
    // the shared count must land on the same key the force loop reads back.
    const a = node('A', 0, 0)
    const b = node('B', 130, 0)
    const n = node('n', 0, 0)
    const force = forceAreaSeparation(opts)
    force.config(['A', 'B'], new Map([['n', ['A', 'B']]]))
    force.initialize([a, b, n])

    // R 70 + 70 = 140, minus 1 shared * 20 = need 120 < dist 130 ⇒ no push
    force(1)

    expect(a.vx).toBe(0)
    expect(b.vx).toBe(0)
  })

  it('grows an area circle with its visible child count', () => {
    const w = node('W', 0, 0)
    const m = node('M', 80, 0)
    const n1 = node('n1', 0, 0)
    const n2 = node('n2', 0, 0)
    const force = forceAreaSeparation({
      ...opts,
      radiusBase: 0,
      radiusPerChild: 50,
      sharedAllowance: 0,
    })
    force.config(
      ['W', 'M'],
      new Map([
        ['n1', ['W']],
        ['n2', ['W']],
      ])
    )
    force.initialize([w, m, n1, n2])

    // W gains 2 * 50 = 100, M stays 0 ⇒ need 100 > dist 80 ⇒ push
    force(1)

    expect(w.vx).toBeLessThan(0)
    expect(m.vx).toBeGreaterThan(0)
  })

  it('separates coincident centres along the x axis', () => {
    const w = node('W', 0, 0)
    const m = node('M', 0, 0)
    const force = forceAreaSeparation(opts)
    force.config(['W', 'M'], new Map())
    force.initialize([w, m])

    force(1)

    expect(w.vx).toBeLessThan(0)
    expect(m.vx).toBeGreaterThan(0)
    expect(w.vy).toBe(0)
    expect(m.vy).toBe(0)
  })

  it('ignores a node with no area gate', () => {
    const w = node('W', 0, 0)
    const m = node('M', 100, 0)
    const stray = node('stray', 50, 50) // not an area, not in areasByNode
    const force = forceAreaSeparation(opts)
    force.config(['W', 'M'], new Map())
    force.initialize([w, m, stray])

    force(1)

    expect(w.vx).toBe(-10) // same as the two-area case — stray contributes nothing
    expect(stray.vx).toBe(0)
  })

  it('chains from config', () => {
    const force = forceAreaSeparation(opts)
    expect(force.config([], new Map())).toBe(force)
  })
})
