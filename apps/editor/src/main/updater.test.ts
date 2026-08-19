import { describe, expect, it, vi } from 'vitest'
import { startAutoUpdates, type Updater } from './updater'

const createUpdater = (result: Promise<unknown>): Updater => ({
  checkForUpdatesAndNotify: vi.fn().mockReturnValue(result) as Updater['checkForUpdatesAndNotify'],
})

describe('startAutoUpdates', () => {
  it('does nothing outside a packaged build - there is nothing to replace', () => {
    const updater = createUpdater(Promise.resolve(null))

    startAutoUpdates(false, updater)

    expect(updater.checkForUpdatesAndNotify).not.toHaveBeenCalled()
  })

  it('checks for updates in a packaged build', () => {
    const updater = createUpdater(Promise.resolve(null))

    startAutoUpdates(true, updater)

    expect(updater.checkForUpdatesAndNotify).toHaveBeenCalledOnce()
  })

  it('logs a failed check instead of letting it take the app down', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const failure = new Error('offline')

    startAutoUpdates(true, createUpdater(Promise.reject(failure)))
    // The rejection is handled inside the call; flush the microtask queue.
    await vi.waitFor(() => {
      expect(error).toHaveBeenCalledWith('Update check failed', failure)
    })

    error.mockRestore()
  })
})
