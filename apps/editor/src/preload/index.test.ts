import { CLAUDE_CHANNELS, FILE_CHANNELS, GITHUB_CHANNELS, MENU_CHANNELS } from '../shared/ipc'
import type { EditorAPI } from './index'

const { exposeInMainWorld, invoke, on, removeListener } = vi.hoisted(() => ({
  exposeInMainWorld: vi.fn(),
  invoke: vi.fn().mockResolvedValue({ success: true, data: null }),
  on: vi.fn(),
  removeListener: vi.fn(),
}))

vi.mock('electron', () => ({
  contextBridge: { exposeInMainWorld },
  ipcRenderer: { invoke, on, removeListener },
}))

await import('./index')

describe('preload editorAPI', () => {
  const [name, api] = exposeInMainWorld.mock.calls[0] as [string, EditorAPI]

  it('exposes the bridge under window.editorAPI', () => {
    expect(name).toBe('editorAPI')
    expect(exposeInMainWorld).toHaveBeenCalledTimes(1)
  })

  it('maps each method to its IPC channel', async () => {
    await api.file.open()
    expect(invoke).toHaveBeenLastCalledWith(FILE_CHANNELS.open)

    await api.file.save('C:\\notes.md', 'body')
    expect(invoke).toHaveBeenLastCalledWith(FILE_CHANNELS.save, 'C:\\notes.md', 'body')

    await api.file.setDirty(true)
    expect(invoke).toHaveBeenLastCalledWith(FILE_CHANNELS.setDirty, true)

    await api.file.confirmDiscard()
    expect(invoke).toHaveBeenLastCalledWith(FILE_CHANNELS.confirmDiscard)

    await api.claude.editSelection('old', 'improve')
    expect(invoke).toHaveBeenLastCalledWith(CLAUDE_CHANNELS.editSelection, 'old', 'improve')
  })

  it('maps each GitHub method to its channel', async () => {
    await api.github.status()
    expect(invoke).toHaveBeenLastCalledWith(GITHUB_CHANNELS.status)

    await api.github.signIn('github_pat_123')
    expect(invoke).toHaveBeenLastCalledWith(GITHUB_CHANNELS.signIn, 'github_pat_123')

    await api.github.signOut()
    expect(invoke).toHaveBeenLastCalledWith(GITHUB_CHANNELS.signOut)

    // No URL argument — the browser target is main's constant, not the renderer's.
    await api.github.openTokenSettings()
    expect(invoke).toHaveBeenLastCalledWith(GITHUB_CHANNELS.openTokenSettings)
  })

  it('relays menu actions to the subscriber until unsubscribed', () => {
    const callback = vi.fn()
    const unsubscribe = api.menu.onAction(callback)

    const [channel, handler] = on.mock.calls[0] as [
      string,
      (event: unknown, action: string) => void,
    ]
    expect(channel).toBe(MENU_CHANNELS.action)

    handler({}, 'save')
    expect(callback).toHaveBeenCalledWith('save')

    unsubscribe()
    expect(removeListener).toHaveBeenCalledWith(MENU_CHANNELS.action, handler)
  })
})
