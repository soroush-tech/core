import { describe, expect, it } from 'vitest'
import defineBench, { isBenchConfig } from './index'

const okCases = { a: () => 1, b: () => 2 }

describe('defineBench', () => {
  it('returns a frozen copy of a valid config', () => {
    const config = defineBench({ name: 'cmp', cases: okCases })
    expect(config).toEqual({ name: 'cmp', cases: okCases })
    expect(Object.isFrozen(config)).toBe(true)
  })

  it('accepts optional packages and options', () => {
    const config = defineBench({
      name: 'cmp',
      packages: { v4: 'lodash@4.17.21' },
      cases: okCases,
      options: { gc: 'inner', rounds: 3, warmup: 0 },
    })
    expect(config.packages).toEqual({ v4: 'lodash@4.17.21' })
    expect(config.options).toEqual({ gc: 'inner', rounds: 3, warmup: 0 })
  })

  it.each([
    ['', okCases],
    ['   ', okCases],
  ])('rejects a blank name (%j)', (name) => {
    expect(() => defineBench({ name, cases: okCases })).toThrow(/non-empty string/)
  })

  it('rejects a non-string name', () => {
    // @ts-expect-error exercising runtime guard
    expect(() => defineBench({ name: 42, cases: okCases })).toThrow(/non-empty string/)
  })

  it('rejects fewer than two cases', () => {
    expect(() => defineBench({ name: 'cmp', cases: { only: () => 1 } })).toThrow(
      /at least two cases/
    )
  })

  it('treats a missing cases map as zero cases', () => {
    // @ts-expect-error exercising runtime guard
    expect(() => defineBench({ name: 'cmp' })).toThrow(/at least two cases/)
  })

  it('rejects a non-function case', () => {
    // @ts-expect-error exercising runtime guard
    expect(() => defineBench({ name: 'cmp', cases: { a: () => 1, b: 2 } })).toThrow(
      /case "b" must be a function/
    )
  })

  it.each([['', 'lodash'], ['  ']])('rejects a blank install spec (%j)', (spec) => {
    expect(() => defineBench({ name: 'cmp', cases: okCases, packages: { v4: spec } })).toThrow(
      /package "v4"/
    )
  })

  it('rejects a non-string install spec', () => {
    expect(() =>
      // @ts-expect-error exercising runtime guard
      defineBench({ name: 'cmp', cases: okCases, packages: { v4: 4 } })
    ).toThrow(/package "v4"/)
  })

  it.each([1.5, -1])('rejects an invalid options.warmup (%j)', (warmup) => {
    expect(() => defineBench({ name: 'cmp', cases: okCases, options: { warmup } })).toThrow(
      /`options\.warmup` must be a non-negative integer/
    )
  })

  it.each([0, 1.5])('rejects an invalid options.rounds (%j)', (rounds) => {
    expect(() => defineBench({ name: 'cmp', cases: okCases, options: { rounds } })).toThrow(
      /`options\.rounds` must be a positive integer/
    )
  })

  it('rejects an invalid options.gc', () => {
    expect(() =>
      // @ts-expect-error exercising runtime guard
      defineBench({ name: 'cmp', cases: okCases, options: { gc: 'always' } })
    ).toThrow(/`options\.gc` must be false, 'once', or 'inner'/)
  })

  it.each(['once', 'inner', false] as const)('accepts gc: %j', (gc) => {
    expect(defineBench({ name: 'cmp', cases: okCases, options: { gc } }).options?.gc).toBe(gc)
  })

  it('accepts options.sandbox', () => {
    const config = defineBench({
      name: 'cmp',
      cases: okCases,
      options: { sandbox: { cpuset: '0', cpus: 1, memory: '512m', tag: 't', mount: ['a:/a'] } },
    })
    expect(config.options?.sandbox).toEqual({
      cpuset: '0',
      cpus: 1,
      memory: '512m',
      tag: 't',
      mount: ['a:/a'],
    })
  })

  it.each([0, -1, Number.NaN])('rejects an invalid options.sandbox.cpus (%j)', (cpus) => {
    expect(() =>
      defineBench({ name: 'cmp', cases: okCases, options: { sandbox: { cpus } } })
    ).toThrow(/`options\.sandbox\.cpus` must be a positive number/)
  })
})

describe('isBenchConfig', () => {
  it('is true only for a defineBench result', () => {
    expect(isBenchConfig(defineBench({ name: 'cmp', cases: okCases }))).toBe(true)
    expect(isBenchConfig({ name: 'cmp', cases: okCases })).toBe(false) // plain object
    expect(isBenchConfig(null)).toBe(false)
    expect(isBenchConfig('nope')).toBe(false)
  })
})
