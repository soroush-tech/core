import { describe, expect, it } from 'vitest'
import * as ss from './index'

describe('aggregator', () => {
  it('exposes the engine, composed parsers and single-prop functions', () => {
    expect(typeof ss.system).toBe('function')
    expect(typeof ss.compose).toBe('function')
    expect(typeof ss.space).toBe('function')
    expect(typeof ss.width).toBe('function')
    expect(typeof ss.opacity).toBe('function')
    expect(typeof ss.fontSize).toBe('function')
    expect(typeof ss.alignItems).toBe('function')
    expect(typeof ss.gridGap).toBe('function')
    expect(typeof ss.borderColor).toBe('function')
    expect(typeof ss.backgroundImage).toBe('function')
    expect(typeof ss.zIndex).toBe('function')
    expect(typeof ss.style).toBe('function')
    expect(typeof ss.variant).toBe('function')
  })

  it('aliases borders to border and box/textShadow to shadow', () => {
    expect(ss.borders).toBe(ss.border)
    expect(ss.boxShadow).toBe(ss.shadow)
    expect(ss.textShadow).toBe(ss.shadow)
  })

  it('a single-prop function resolves like its parser', () => {
    expect(ss.width({ width: 0.5 })).toEqual({ width: '50%' })
    expect(ss.zIndex({ zIndex: 'modal', theme: { zIndices: { modal: 10 } } })).toEqual({
      zIndex: 10,
    })
  })
})
