import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const { existsSync, copyFileSync } = vi.hoisted(() => ({
  existsSync: vi.fn(),
  copyFileSync: vi.fn(),
}))

vi.mock('node:fs', () => ({ existsSync, copyFileSync }))

// The script runs its branch table as a side effect on import, so re-import it per case.
const run = async () => {
  vi.resetModules()
  await import('./setup-env.mjs')
}

describe('setup-env', () => {
  let log
  const originalCI = process.env.CI

  beforeEach(() => {
    existsSync.mockReset()
    copyFileSync.mockReset()
    log = vi.spyOn(console, 'log').mockImplementation(() => {})
    delete process.env.CI
  })

  afterEach(() => {
    log.mockRestore()
    if (originalCI === undefined) delete process.env.CI
    else process.env.CI = originalCI
  })

  it('skips in CI without touching the filesystem', async () => {
    process.env.CI = '1'
    await run()
    expect(existsSync).not.toHaveBeenCalled()
    expect(copyFileSync).not.toHaveBeenCalled()
    expect(log).toHaveBeenCalledWith(expect.stringContaining('CI detected'))
  })

  it('does nothing when the template is missing', async () => {
    existsSync.mockReturnValue(false)
    await run()
    expect(copyFileSync).not.toHaveBeenCalled()
    expect(log).toHaveBeenCalledWith(expect.stringContaining('nothing to copy'))
  })

  it('leaves an existing .env untouched', async () => {
    existsSync.mockReturnValue(true)
    await run()
    expect(copyFileSync).not.toHaveBeenCalled()
    expect(log).toHaveBeenCalledWith(expect.stringContaining('already exists'))
  })

  it('copies default.env -> .env on first setup', async () => {
    existsSync.mockImplementation((path) => path.endsWith('default.env'))
    await run()
    expect(copyFileSync).toHaveBeenCalledOnce()
    expect(log).toHaveBeenCalledWith(expect.stringContaining('created'))
  })
})
