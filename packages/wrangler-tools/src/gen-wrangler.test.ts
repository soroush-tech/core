import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest'
import { resolve } from 'node:path'
import { generate, renderConfig, shouldGenerate } from './gen-wrangler'

const { readFileSync, writeFileSync } = vi.hoisted(() => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}))

vi.mock('node:fs', () => ({ readFileSync, writeFileSync }))

describe('shouldGenerate', () => {
  it('is true only when every ID var is present', () => {
    expect(shouldGenerate({ WORKER_NAME: 'w', APP_ID: '1' }, ['WORKER_NAME', 'APP_ID'])).toBe(true)
  })

  it('is false when an ID var is missing', () => {
    expect(shouldGenerate({ WORKER_NAME: 'w' }, ['WORKER_NAME', 'APP_ID'])).toBe(false)
  })
})

describe('renderConfig', () => {
  it('substitutes every ${VAR} from env', () => {
    const out = renderConfig('name=${WORKER_NAME} app=${APP_ID}', {
      WORKER_NAME: 'bench-api',
      APP_ID: '12345',
    })
    expect(out).toBe('name=bench-api app=12345')
  })

  it('throws on a missing or empty var', () => {
    expect(() => renderConfig('x=${MISSING}', {})).toThrow('missing env var MISSING')
    expect(() => renderConfig('x=${EMPTY}', { EMPTY: '' })).toThrow('missing env var EMPTY')
  })
})

describe('generate', () => {
  let log: MockInstance
  let loadEnvFile: MockInstance

  beforeEach(() => {
    readFileSync.mockReset()
    writeFileSync.mockReset()
    log = vi.spyOn(console, 'log').mockImplementation(() => {})
    loadEnvFile = vi.spyOn(process, 'loadEnvFile').mockImplementation(() => {})
  })

  afterEach(() => {
    log.mockRestore()
    loadEnvFile.mockRestore()
  })

  it('renders the template into wrangler.json when the ID vars are set', () => {
    readFileSync.mockReturnValue('name=${WORKER_NAME}')
    generate('/w', ['WORKER_NAME'], { WORKER_NAME: 'api' })

    expect(loadEnvFile).toHaveBeenCalledWith(resolve('/w', '.env'))
    expect(readFileSync).toHaveBeenCalledWith(resolve('/w', 'default.wrangler.json'), 'utf8')
    expect(writeFileSync).toHaveBeenCalledWith(resolve('/w', 'wrangler.json'), 'name=api')
    expect(log).toHaveBeenCalledWith(expect.stringContaining('wrote wrangler.json'))
  })

  it('leaves wrangler.json untouched when ID vars are absent, even without a .env', () => {
    loadEnvFile.mockImplementation(() => {
      throw new Error('ENOENT')
    })
    generate('/w', ['WORKER_NAME'], {})

    expect(readFileSync).not.toHaveBeenCalled()
    expect(writeFileSync).not.toHaveBeenCalled()
    expect(log).toHaveBeenCalledWith(expect.stringContaining('leaving any local wrangler.json'))
  })
})
