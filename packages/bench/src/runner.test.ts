import { describe, expect, it, vi } from 'vitest'
import defineBench from './index'
import {
  checkRatio,
  formatDeltas,
  formatMarkdown,
  formatRatioFailure,
  installSpecs,
  loadModules,
  median,
  medianRounds,
  registerCases,
} from './runner'

describe('installSpecs', () => {
  it('maps aliases to npm alias specifiers', () => {
    expect(installSpecs({ v4: 'lodash@4.17.21', v5: 'lodash@5.0.0' })).toEqual([
      'v4@npm:lodash@4.17.21',
      'v5@npm:lodash@5.0.0',
    ])
  })

  it('returns an empty list when no packages are declared', () => {
    expect(installSpecs()).toEqual([])
  })
})

describe('loadModules', () => {
  it('resolves each alias through the injected resolver', async () => {
    const resolve = vi.fn(async (alias: string) => ({ name: alias }))
    const modules = await loadModules({ v4: 'lodash@4', v5: 'lodash@5' }, resolve)
    expect(modules).toEqual({ v4: { name: 'v4' }, v5: { name: 'v5' } })
    expect(resolve).toHaveBeenCalledTimes(2)
  })

  it('returns an empty record when no packages are declared', async () => {
    const resolve = vi.fn()
    expect(await loadModules(undefined, resolve)).toEqual({})
    expect(resolve).not.toHaveBeenCalled()
  })
})

describe('registerCases', () => {
  it('registers each case under a prefixed label and passes the context', () => {
    const calls: string[] = []
    const a = vi.fn()
    const b = vi.fn()
    const config = defineBench({ name: 'clone', cases: { a, b } })
    const modules = { v4: {} }

    const labels = registerCases(config, modules, (name, fn) => {
      calls.push(name)
      fn()
    })

    expect(labels).toEqual(['clone :: a', 'clone :: b'])
    expect(calls).toEqual(['clone :: a', 'clone :: b'])
    expect(a).toHaveBeenCalledWith({ modules })
    expect(b).toHaveBeenCalledWith({ modules })
  })
})

describe('formatDeltas', () => {
  it('returns an empty string with fewer than two means', () => {
    expect(formatDeltas([])).toBe('')
    expect(formatDeltas([{ label: 'only', avg: 5 }])).toBe('')
  })

  it('tags the fastest and reports each other as a percentage slower', () => {
    expect(
      formatDeltas([
        { label: 'a', avg: 100 },
        { label: 'b', avg: 250 },
      ])
    ).toBe(['delta vs fastest:', '  a — fastest', '  b — +150.0% slower'].join('\n'))
  })

  it('picks the fastest regardless of order and rounds to one decimal', () => {
    expect(
      formatDeltas([
        { label: 'slow', avg: 163 },
        { label: 'fast', avg: 60 },
      ])
    ).toBe(['delta vs fastest:', '  slow — +171.7% slower', '  fast — fastest'].join('\n'))
  })
})

describe('formatMarkdown', () => {
  it('returns an empty string with no rows', () => {
    expect(formatMarkdown([])).toBe('')
  })

  it('sorts fastest-first and formats time, allocation, and % across unit ranges', () => {
    expect(
      formatMarkdown([
        { label: 'ns', avg: 500, p75: 600, alloc: 500 },
        { label: 'us', avg: 2000, p75: 2500, alloc: 5000 },
        { label: 'ms', avg: 2_000_000, p75: 2_100_000, alloc: 2_000_000 },
        { label: 'noalloc', avg: 500, p75: 500 },
      ])
    ).toBe(
      [
        '| case | avg | p75 | alloc/iter | vs fastest |',
        '| --- | ---: | ---: | ---: | :--- |',
        '| ns | 500 ns | 600 ns | 500 B (least) | fastest |',
        '| noalloc | 500 ns | 500 ns | — | fastest |',
        '| us | 2.00 µs | 2.50 µs | 5.00 KB (+900.0%) | +300.0% |',
        '| ms | 2.00 ms | 2.10 ms | 2.00 MB (+399900.0%) | +399900.0% |',
      ].join('\n')
    )
  })

  it('adds a gc/iter column only when at least one case measured GC', () => {
    expect(
      formatMarkdown([
        { label: 'a', avg: 1000, p75: 1100, alloc: 2000, gc: 500_000 },
        { label: 'b', avg: 3000, p75: 3100, alloc: 4000 },
      ])
    ).toBe(
      [
        '| case | avg | p75 | alloc/iter | gc/iter | vs fastest |',
        '| --- | ---: | ---: | ---: | ---: | :--- |',
        '| a | 1.00 µs | 1.10 µs | 2.00 KB (least) | 500.00 µs | fastest |',
        '| b | 3.00 µs | 3.10 µs | 4.00 KB (+100.0%) | — | +200.0% |',
      ].join('\n')
    )
  })
})

describe('checkRatio', () => {
  const rows = [
    { label: 'color() :: local', avg: 125, p75: 130 },
    { label: 'color() :: upstream', avg: 100, p75: 105 },
  ]

  it('matches the baseline by case key and reports cases below the target', () => {
    // local runs at 100/125 = 80% of the baseline's speed — fails a 90% target.
    expect(checkRatio(rows, 'upstream', 90)).toEqual([{ label: 'color() :: local', ratioPct: 80 }])
  })

  it('passes cases at or above the target', () => {
    expect(checkRatio(rows, 'upstream', 80)).toEqual([])
    expect(checkRatio(rows, 'upstream', 79)).toEqual([])
  })

  it('matches the baseline by full label too', () => {
    expect(checkRatio(rows, 'color() :: upstream', 90)).toEqual([
      { label: 'color() :: local', ratioPct: 80 },
    ])
  })

  it('uses the whole label as the key for rows without a name prefix', () => {
    expect(
      checkRatio(
        [
          { label: 'slow', avg: 400, p75: 400 },
          { label: 'n :: base', avg: 100, p75: 100 },
        ],
        'base',
        50
      )
    ).toEqual([{ label: 'slow', ratioPct: 25 }])
  })

  it('flags a case faster than the baseline only against a >100% target', () => {
    const fast = [
      { label: 'n :: base', avg: 100, p75: 100 },
      { label: 'n :: quick', avg: 50, p75: 50 },
    ]
    expect(checkRatio(fast, 'base', 100)).toEqual([])
    expect(checkRatio(fast, 'base', 250)).toEqual([{ label: 'n :: quick', ratioPct: 200 }])
  })

  it('throws when the baseline case is missing, listing what exists', () => {
    expect(() => checkRatio(rows, 'nope', 80)).toThrow(
      /baseline case "nope" not found among: color\(\) :: local, color\(\) :: upstream/
    )
  })

  it('throws when only the baseline survived — a crashed case must not pass', () => {
    expect(() => checkRatio([{ label: 'n :: base', avg: 100, p75: 100 }], 'base', 80)).toThrow(
      /no case besides the baseline "base" produced results/
    )
  })
})

describe('formatRatioFailure', () => {
  it('returns an empty string when nothing breached', () => {
    expect(formatRatioFailure([], 80)).toBe('')
  })

  it('names each breaching case with its percentage and the target', () => {
    expect(
      formatRatioFailure(
        [
          { label: 'n :: a', ratioPct: 72.34 },
          { label: 'n :: b', ratioPct: 55 },
        ],
        80
      )
    ).toBe(
      [
        'bench: performance target failed (min ratio 80%):',
        '  n :: a — 72.3% of baseline speed',
        '  n :: b — 55.0% of baseline speed',
      ].join('\n')
    )
  })
})

describe('median', () => {
  it('returns the middle value for odd-length input, regardless of order', () => {
    expect(median([30, 10, 20])).toBe(20)
  })

  it('averages the two middles for even-length input', () => {
    expect(median([10, 20, 30, 40])).toBe(25)
  })
})

describe('medianRounds', () => {
  it('takes the per-case median across rounds, keeping first-seen order', () => {
    expect(
      medianRounds([
        [
          { label: 'a', avg: 100, p75: 110, alloc: 1000, gc: 100 },
          { label: 'b', avg: 200, p75: 210, alloc: 2000 },
        ],
        [
          { label: 'a', avg: 300, p75: 310, alloc: 3000, gc: 300 },
          { label: 'b', avg: 400, p75: 410, alloc: 4000 },
        ],
        [
          { label: 'a', avg: 200, p75: 220, alloc: 2000, gc: 200 },
          { label: 'b', avg: 600, p75: 620, alloc: 6000 },
        ],
      ])
    ).toEqual([
      { label: 'a', avg: 200, p75: 220, alloc: 2000, gc: 200 },
      { label: 'b', avg: 400, p75: 410, alloc: 4000, gc: undefined },
    ])
  })

  it('reports alloc only from the rounds that measured it, else undefined', () => {
    expect(
      medianRounds([
        [{ label: 'a', avg: 100, p75: 100, alloc: 500 }],
        [{ label: 'a', avg: 200, p75: 200 }],
        [{ label: 'a', avg: 300, p75: 300, alloc: 1500 }],
      ])
    ).toEqual([{ label: 'a', avg: 200, p75: 200, alloc: 1000 }])

    expect(medianRounds([[{ label: 'a', avg: 5, p75: 5 }]])).toEqual([
      { label: 'a', avg: 5, p75: 5, alloc: undefined },
    ])
  })
})
