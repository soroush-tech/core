import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest'
import { resolve } from 'node:path'
import { setupEnv } from './setup-env'

const { existsSync, copyFileSync } = vi.hoisted(() => ({
  existsSync: vi.fn(),
  copyFileSync: vi.fn(),
}))

vi.mock('node:fs', () => ({ existsSync, copyFileSync }))

describe('setupEnv', () => {
  let log: MockInstance

  beforeEach(() => {
    existsSync.mockReset()
    copyFileSync.mockReset()
    log = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    log.mockRestore()
  })

  it('skips in CI without touching the filesystem', () => {
    setupEnv('/w', { CI: '1' })
    expect(existsSync).not.toHaveBeenCalled()
    expect(copyFileSync).not.toHaveBeenCalled()
    expect(log).toHaveBeenCalledWith(expect.stringContaining('CI detected'))
  })

  it('does nothing when the template is missing', () => {
    existsSync.mockReturnValue(false)
    setupEnv('/w', {})
    expect(copyFileSync).not.toHaveBeenCalled()
    expect(log).toHaveBeenCalledWith(expect.stringContaining('nothing to copy'))
  })

  it('leaves an existing .env untouched', () => {
    existsSync.mockReturnValue(true)
    setupEnv('/w', {})
    expect(copyFileSync).not.toHaveBeenCalled()
    expect(log).toHaveBeenCalledWith(expect.stringContaining('already exists'))
  })

  it('copies default.env -> .env on first setup', () => {
    existsSync.mockImplementation((path: string) => path.endsWith('default.env'))
    setupEnv('/w', {})
    expect(copyFileSync).toHaveBeenCalledOnce()
    expect(copyFileSync).toHaveBeenCalledWith(resolve('/w', 'default.env'), resolve('/w', '.env'))
    expect(log).toHaveBeenCalledWith(expect.stringContaining('created'))
  })
})
