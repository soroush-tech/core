import {
  CLAUDE_CHANNELS,
  FILE_CHANNELS,
  GIST_CHANNELS,
  GITHUB_CHANNELS,
  MENU_CHANNELS,
  UPDATE_CHANNELS,
} from '../shared/ipc'
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
    expect(invoke).toHaveBeenLastCalledWith(FILE_CHANNELS.save, 'C:\\notes.md', 'body', null)

    await api.file.save(null, 'body', 'en.md')
    expect(invoke).toHaveBeenLastCalledWith(FILE_CHANNELS.save, null, 'body', 'en.md')

    await api.file.setDirty(true, false)
    expect(invoke).toHaveBeenLastCalledWith(FILE_CHANNELS.setDirty, true, false)

    await api.file.confirmDiscard()
    expect(invoke).toHaveBeenLastCalledWith(FILE_CHANNELS.confirmDiscard)

    await api.claude.startEdit('old', 'improve')
    expect(invoke).toHaveBeenLastCalledWith(CLAUDE_CHANNELS.startEdit, 'old', 'improve', null)

    await api.claude.startEdit('old', 'improve', '# Rehydration')
    expect(invoke).toHaveBeenLastCalledWith(
      CLAUDE_CHANNELS.startEdit,
      'old',
      'improve',
      '# Rehydration'
    )

    await api.claude.cancel('run-1')
    expect(invoke).toHaveBeenLastCalledWith(CLAUDE_CHANNELS.cancel, 'run-1')
  })

  it('maps each GitHub method to its channel', async () => {
    await api.github.status()
    expect(invoke).toHaveBeenLastCalledWith(GITHUB_CHANNELS.status)

    await api.github.signIn('github_pat_123')
    expect(invoke).toHaveBeenLastCalledWith(GITHUB_CHANNELS.signIn, 'github_pat_123')

    await api.github.signOut()
    expect(invoke).toHaveBeenLastCalledWith(GITHUB_CHANNELS.signOut)

    // No URL argument - the browser target is main's constant, not the renderer's.
    await api.github.openTokenSettings()
    expect(invoke).toHaveBeenLastCalledWith(GITHUB_CHANNELS.openTokenSettings)

    // No token argument either - main reads the stored one.
    await api.gists.list()
    expect(invoke).toHaveBeenLastCalledWith(GIST_CHANNELS.list)

    await api.gists.files('abc123')
    expect(invoke).toHaveBeenLastCalledWith(GIST_CHANNELS.files, 'abc123')

    await api.gists.drafts()
    expect(invoke).toHaveBeenLastCalledWith(GIST_CHANNELS.drafts)

    await api.gists.draft('abc123')
    expect(invoke).toHaveBeenLastCalledWith(GIST_CHANNELS.draft, 'abc123')

    const entry = { status: 'modified', content: 'edited' } as const
    await api.gists.stage('abc123', 'notes.md', entry)
    expect(invoke).toHaveBeenLastCalledWith(GIST_CHANNELS.stage, 'abc123', 'notes.md', entry)

    await api.gists.renameFile('abc123', 'notes.md', 'renamed.md', '# notes')
    expect(invoke).toHaveBeenLastCalledWith(
      GIST_CHANNELS.renameFile,
      'abc123',
      'notes.md',
      'renamed.md',
      '# notes'
    )

    await api.gists.stageDescription('abc123', 'A better one')
    expect(invoke).toHaveBeenLastCalledWith(
      GIST_CHANNELS.stageDescription,
      'abc123',
      'A better one'
    )

    await api.gists.reset('abc123')
    expect(invoke).toHaveBeenLastCalledWith(GIST_CHANNELS.reset, 'abc123')

    await api.gists.publish('abc123', false)
    expect(invoke).toHaveBeenLastCalledWith(GIST_CHANNELS.publish, 'abc123', false)
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

  it('relays gist draft changes to the subscriber until unsubscribed', () => {
    const callback = vi.fn()
    const unsubscribe = api.gists.onDraftChanged(callback)

    const [channel, handler] = on.mock.lastCall as [
      string,
      (event: unknown, change: unknown) => void,
    ]
    expect(channel).toBe(GIST_CHANNELS.draftChanged)

    const change = { gistId: 'abc123', draft: {} }
    handler({}, change)
    expect(callback).toHaveBeenCalledWith(change)

    unsubscribe()
    expect(removeListener).toHaveBeenCalledWith(GIST_CHANNELS.draftChanged, handler)
  })

  it('relays Claude run events to the subscriber until unsubscribed', () => {
    const callback = vi.fn()
    const unsubscribe = api.claude.onEvent(callback)

    const [channel, handler] = on.mock.lastCall as [
      string,
      (event: unknown, claudeEvent: unknown) => void,
    ]
    expect(channel).toBe(CLAUDE_CHANNELS.event)

    const claudeEvent = { type: 'RUN_STARTED', runId: 'run-1' }
    handler({}, claudeEvent)
    expect(callback).toHaveBeenCalledWith(claudeEvent)

    unsubscribe()
    expect(removeListener).toHaveBeenCalledWith(CLAUDE_CHANNELS.event, handler)
  })

  it('maps the update install to its channel', async () => {
    await api.update.install()
    expect(invoke).toHaveBeenLastCalledWith(UPDATE_CHANNELS.install)
  })

  it('relays the downloaded version to the subscriber until unsubscribed', () => {
    const callback = vi.fn()
    const unsubscribe = api.update.onDownloaded(callback)

    const [channel, handler] = on.mock.lastCall as [
      string,
      (event: unknown, version: string) => void,
    ]
    expect(channel).toBe(UPDATE_CHANNELS.downloaded)

    handler({}, '0.4.0')
    expect(callback).toHaveBeenCalledWith('0.4.0')

    unsubscribe()
    expect(removeListener).toHaveBeenCalledWith(UPDATE_CHANNELS.downloaded, handler)
  })
})
