import { FILE_CHANNELS } from '../shared/ipc'
import type { EditorAPI } from './index'

const { exposeInMainWorld, invoke } = vi.hoisted(() => ({
  exposeInMainWorld: vi.fn(),
  invoke: vi.fn().mockResolvedValue({ success: true, data: null }),
}))

vi.mock('electron', () => ({
  contextBridge: { exposeInMainWorld },
  ipcRenderer: { invoke },
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
  })
})
