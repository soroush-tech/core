import type { BrowserWindow } from 'electron'
import { aboutMessage, showAboutDialog } from './about'

const { getVersion, showMessageBox } = vi.hoisted(() => ({
  getVersion: vi.fn(() => '0.2.1'),
  showMessageBox: vi.fn(() => Promise.resolve({ response: 0 })),
}))

vi.mock('electron', () => ({ app: { getVersion }, dialog: { showMessageBox } }))

const openWindow = { isDestroyed: () => false } as unknown as BrowserWindow

describe('aboutMessage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('names the app and the build a report would be filed against', () => {
    expect(aboutMessage().message).toBe('Soroush Editor 0.2.1')
  })

  it('carries the runtime versions a bug report needs', () => {
    const { detail } = aboutMessage()
    for (const runtime of ['Electron', 'Chromium', 'Node']) expect(detail).toContain(runtime)
    expect(detail).toContain(process.versions.node)
  })
})

describe('showAboutDialog', () => {
  beforeEach(() => vi.clearAllMocks())

  it('hangs the dialog off the open window, so it cannot be lost behind it', () => {
    showAboutDialog(openWindow)
    expect(showMessageBox).toHaveBeenCalledWith(
      openWindow,
      expect.objectContaining({ title: 'About', message: 'Soroush Editor 0.2.1' })
    )
  })

  it.each([
    ['no window', null],
    ['a window that has been destroyed', { isDestroyed: () => true } as unknown as BrowserWindow],
  ])('shows an unowned dialog when there is %s', (_name, window) => {
    showAboutDialog(window)
    expect(showMessageBox).toHaveBeenCalledWith(expect.objectContaining({ title: 'About' }))
  })
})
