import { describe, it, expect } from 'vitest'
import type { PageContext } from 'vike/types'
import { data } from './+data'

describe('data', () => {
  it('returns social meta sourced from config', () => {
    const result = data({ config: { title: 'T', description: 'D' } } as unknown as PageContext)
    expect(result.meta).toContainEqual({ property: 'og:title', content: 'T' })
    expect(result.meta).toContainEqual({ property: 'og:description', content: 'D' })
  })
})
