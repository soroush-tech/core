import { describe, it, expect } from 'vitest'
import { REQUIRED, shouldGenerate, renderConfig } from './gen-wrangler.mjs'

describe('shouldGenerate', () => {
  it('is true only when every ID var is present', () => {
    const env = Object.fromEntries(REQUIRED.map((k) => [k, 'x']))
    expect(shouldGenerate(env)).toBe(true)
  })

  it('is false when an ID var is missing', () => {
    expect(shouldGenerate({})).toBe(false)
  })
})

describe('renderConfig', () => {
  it('substitutes every ${VAR} from env', () => {
    const out = renderConfig('name=${WORKER_NAME} app=${BENCH_GH_APP_ID}', {
      WORKER_NAME: 'bench-api',
      BENCH_GH_APP_ID: '12345',
    })
    expect(out).toBe('name=bench-api app=12345')
  })

  it('throws on a missing or empty var', () => {
    expect(() => renderConfig('x=${MISSING}', {})).toThrow('missing env var MISSING')
    expect(() => renderConfig('x=${EMPTY}', { EMPTY: '' })).toThrow('missing env var EMPTY')
  })
})
