import { describe, it, expect } from 'vitest'
import type { InsertAction } from 'src/theme/Markdown/const'
import { groupToolbarActions } from './groupToolbarActions'

const action = (id: string, group?: string): InsertAction => ({
  id,
  label: id,
  ariaLabel: id,
  group,
  kind: 'insert',
  snippet: id,
})

describe('groupToolbarActions', () => {
  it('returns no segments for an empty list', () => {
    expect(groupToolbarActions([])).toEqual([])
  })

  it('gives each ungrouped action its own segment', () => {
    const a = action('a')
    const b = action('b')
    expect(groupToolbarActions([a, b])).toEqual([[a], [b]])
  })

  it('collapses consecutive actions sharing a group', () => {
    const a = action('a', 'inline')
    const b = action('b', 'inline')
    expect(groupToolbarActions([a, b])).toEqual([[a, b]])
  })

  it('keeps adjacent actions from different groups apart', () => {
    const a = action('a', 'one')
    const b = action('b', 'two')
    expect(groupToolbarActions([a, b])).toEqual([[a], [b]])
  })

  it('does not merge same-group actions split by an ungrouped one', () => {
    const a = action('a', 'inline')
    const gap = action('gap')
    const b = action('b', 'inline')
    expect(groupToolbarActions([a, gap, b])).toEqual([[a], [gap], [b]])
  })
})
