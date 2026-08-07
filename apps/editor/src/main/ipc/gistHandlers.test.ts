import { GIST_CHANNELS } from '../../shared/ipc'

const { handlers, showMessageBox } = vi.hoisted(() => ({
  handlers: new Map<string, (...args: unknown[]) => unknown>(),
  showMessageBox: vi.fn(),
}))

vi.mock('electron', () => ({
  ipcMain: {
    handle: (channel: string, handler: (...args: unknown[]) => unknown) => {
      handlers.set(channel, handler)
    },
  },
  dialog: { showMessageBox },
}))

const { registerGistHandlers } = await import('./gistHandlers')

const service = {
  list: vi.fn(),
  files: vi.fn(),
  draft: vi.fn(),
  drafts: vi.fn(),
  stage: vi.fn(),
  renameFile: vi.fn(),
  stageDescription: vi.fn(),
  reset: vi.fn(),
  publish: vi.fn(),
}
const send = vi.fn()
const window = { webContents: { send } } as never
registerGistHandlers(service, () => window)

const invoke = (channel: string, ...args: unknown[]) => handlers.get(channel)!({}, ...args)

/** The confirmation dialog's "Discard changes" is button 0; anything else cancels. */
const answerReset = (confirmed: boolean) =>
  showMessageBox.mockResolvedValue({ response: confirmed ? 0 : 1 })

const DRAFT = { files: { 'notes.md': { status: 'modified', content: 'edited' } } }

beforeEach(() => vi.clearAllMocks())

describe('registerGistHandlers', () => {
  it('passes the gist list straight through', async () => {
    service.list.mockResolvedValue({ success: true, data: [] })
    await expect(invoke(GIST_CHANNELS.list)).resolves.toEqual({ success: true, data: [] })
  })

  it('ignores anything the renderer sends to list — the token is main-side', async () => {
    service.list.mockResolvedValue({ success: true, data: [] })

    await invoke(GIST_CHANNELS.list, 'some-other-token')
    expect(service.list).toHaveBeenCalledWith()
  })

  it.each([
    [GIST_CHANNELS.files, 'files'],
    [GIST_CHANNELS.draft, 'draft'],
    [GIST_CHANNELS.publish, 'publish'],
  ])('rejects a blank gist id on %s', async (channel, method) => {
    await expect(invoke(channel, '  ')).resolves.toEqual({
      success: false,
      error: 'Invalid gist id',
    })
    expect(service[method as 'files']).not.toHaveBeenCalled()
  })

  it('delegates a valid gist id to files', async () => {
    service.files.mockResolvedValue({ success: true, data: [] })

    await expect(invoke(GIST_CHANNELS.files, 'abc123')).resolves.toEqual({
      success: true,
      data: [],
    })
    expect(service.files).toHaveBeenCalledWith('abc123')
  })

  it('delegates the sandbox id of a gist that does not exist yet', async () => {
    const sandbox = 'new:3f2504e0-4f89-41d3-9a0c-0305e82c3301'
    service.files.mockResolvedValue({ success: true, data: { description: null, files: [] } })

    // Starting a gist is the one case with no id from GitHub to check against;
    // rejecting it would leave the new-gist panel unable to ask for anything.
    await invoke(GIST_CHANNELS.files, sandbox)
    expect(service.files).toHaveBeenCalledWith(sandbox)
  })

  it('refuses an id that only wears the sandbox prefix', async () => {
    await expect(invoke(GIST_CHANNELS.files, 'new:../../evil')).resolves.toEqual({
      success: false,
      error: 'Invalid gist id',
    })
    expect(service.files).not.toHaveBeenCalled()
  })

  it('wraps the draft in a Result', async () => {
    service.draft.mockResolvedValue(DRAFT)

    await expect(invoke(GIST_CHANNELS.draft, 'abc123')).resolves.toEqual({
      success: true,
      data: DRAFT,
    })
  })

  it('wraps every draft in a Result, taking no arguments', async () => {
    const all = { abc123: DRAFT }
    service.drafts.mockResolvedValue(all)

    await expect(invoke(GIST_CHANNELS.drafts, 'ignored')).resolves.toEqual({
      success: true,
      data: all,
    })
    expect(service.drafts).toHaveBeenCalledWith()
  })

  it('publishes a valid gist id', async () => {
    service.publish.mockResolvedValue({ success: true, data: null })

    await expect(invoke(GIST_CHANNELS.publish, 'abc123')).resolves.toEqual({
      success: true,
      data: null,
    })
    expect(service.publish).toHaveBeenCalledWith('abc123', false)
  })

  it.each([
    ['nothing', undefined, false],
    ['false', false, false],
    ['a non-boolean', 'yes', false],
    ['true', true, true],
  ])('publishes with visibility %s', async (_name, isPublic, expected) => {
    service.publish.mockResolvedValue({ success: true, data: null })

    await invoke(GIST_CHANNELS.publish, 'abc123', isPublic)
    // Anything but an explicit true keeps a new gist secret.
    expect(service.publish).toHaveBeenCalledWith('abc123', expected)
  })

  it.each([
    ['a non-string id', 42, 'notes.md', 'Invalid gist id'],
    ['a blank filename', 'abc123', '   ', 'Enter a filename'],
    ['a non-string filename', 'abc123', 42, 'Enter a filename'],
    ['a POSIX path', 'abc123', 'src/new.md', 'A gist filename cannot contain a path separator'],
    ['a Windows path', 'abc123', 'src\\new.md', 'A gist filename cannot contain a path separator'],
  ])('refuses to stage for %s', async (_name, id, filename, error) => {
    await expect(invoke(GIST_CHANNELS.stage, id, filename, null)).resolves.toEqual({
      success: false,
      error,
    })
    expect(service.stage).not.toHaveBeenCalled()
  })

  it('trims the filename before staging', async () => {
    service.stage.mockResolvedValue({ success: true, data: DRAFT })
    const entry = { status: 'modified', content: 'edited' }

    await expect(invoke(GIST_CHANNELS.stage, 'abc123', '  notes.md\n', entry)).resolves.toEqual({
      success: true,
      data: DRAFT,
    })
    expect(service.stage).toHaveBeenCalledWith('abc123', 'notes.md', entry)
  })

  it('renames a file through the service, trimming both names', async () => {
    service.renameFile.mockResolvedValue({ success: true, data: DRAFT })

    await expect(
      invoke(GIST_CHANNELS.renameFile, 'abc123', ' notes.md ', ' renamed.md ', '# notes')
    ).resolves.toEqual({ success: true, data: DRAFT })
    expect(service.renameFile).toHaveBeenCalledWith('abc123', 'notes.md', 'renamed.md', '# notes')
  })

  it.each([
    ['a non-string id', 42, 'notes.md', 'renamed.md', '# notes', 'Invalid gist id'],
    ['a blank old name', 'abc123', '  ', 'renamed.md', '# notes', 'Enter a filename'],
    [
      'a new name carrying a path',
      'abc123',
      'notes.md',
      'src/renamed.md',
      '# notes',
      'A gist filename cannot contain a path separator',
    ],
    ['content that is not text', 'abc123', 'notes.md', 'renamed.md', 42, 'Invalid file content'],
  ])('refuses to rename for %s', async (_name, id, from, to, content, error) => {
    await expect(invoke(GIST_CHANNELS.renameFile, id, from, to, content)).resolves.toEqual({
      success: false,
      error,
    })
    expect(service.renameFile).not.toHaveBeenCalled()
  })

  it.each([
    ['a non-string id', 42, 'A better one', 'Invalid gist id'],
    ['a non-string description', 'abc123', 42, 'Invalid description'],
  ])('refuses to stage a description for %s', async (_name, id, description, error) => {
    await expect(invoke(GIST_CHANNELS.stageDescription, id, description)).resolves.toEqual({
      success: false,
      error,
    })
    expect(service.stageDescription).not.toHaveBeenCalled()
  })

  it.each([
    ['a description', 'A better one'],
    // null clears the staged description rather than staging an empty one.
    ['a clear', null],
  ])('stages %s', async (_name, description) => {
    service.stageDescription.mockResolvedValue({ success: true, data: DRAFT })

    await expect(invoke(GIST_CHANNELS.stageDescription, 'abc123', description)).resolves.toEqual({
      success: true,
      data: DRAFT,
    })
    expect(service.stageDescription).toHaveBeenCalledWith('abc123', description)
  })

  it('resets once the user confirms', async () => {
    answerReset(true)
    service.reset.mockResolvedValue({ success: true, data: null })

    await expect(invoke(GIST_CHANNELS.reset, 'abc123')).resolves.toEqual({
      success: true,
      data: true,
    })
    expect(service.reset).toHaveBeenCalledWith('abc123')
  })

  it('keeps the draft when the user cancels the reset', async () => {
    answerReset(false)

    await expect(invoke(GIST_CHANNELS.reset, 'abc123')).resolves.toEqual({
      success: true,
      data: false,
    })
    expect(service.reset).not.toHaveBeenCalled()
  })

  it('reports a reset that failed to persist', async () => {
    answerReset(true)
    service.reset.mockResolvedValue({ success: false, error: 'EACCES' })

    await expect(invoke(GIST_CHANNELS.reset, 'abc123')).resolves.toEqual({
      success: false,
      error: 'EACCES',
    })
  })

  it('refuses an invalid id on reset without prompting', async () => {
    await expect(invoke(GIST_CHANNELS.reset, 42)).resolves.toEqual({
      success: false,
      error: 'Invalid gist id',
    })
    expect(showMessageBox).not.toHaveBeenCalled()
  })

  describe('announcing draft changes', () => {
    beforeEach(() => {
      service.draft.mockResolvedValue(DRAFT)
      service.stage.mockResolvedValue({ success: true, data: DRAFT })
      service.renameFile.mockResolvedValue({ success: true, data: DRAFT })
      service.stageDescription.mockResolvedValue({ success: true, data: DRAFT })
      service.reset.mockResolvedValue({ success: true, data: null })
      service.publish.mockResolvedValue({ success: true, data: null })
      answerReset(true)
    })

    it.each([
      ['stage', () => invoke(GIST_CHANNELS.stage, 'abc123', 'notes.md', { status: 'deleted' })],
      [
        'renameFile',
        () => invoke(GIST_CHANNELS.renameFile, 'abc123', 'notes.md', 'renamed.md', '# notes'),
      ],
      ['stageDescription', () => invoke(GIST_CHANNELS.stageDescription, 'abc123', 'A better one')],
      ['reset', () => invoke(GIST_CHANNELS.reset, 'abc123')],
      ['publish', () => invoke(GIST_CHANNELS.publish, 'abc123')],
    ])('tells the renderer the draft moved after %s', async (_name, act) => {
      await act()

      expect(send).toHaveBeenCalledWith(GIST_CHANNELS.draftChanged, {
        gistId: 'abc123',
        draft: DRAFT,
      })
    })

    it('says nothing when staging a description fails', async () => {
      service.stageDescription.mockResolvedValue({ success: false, error: 'EACCES' })

      await invoke(GIST_CHANNELS.stageDescription, 'abc123', 'A better one')
      expect(send).not.toHaveBeenCalled()
    })

    it.each([
      ['staging fails', () => service.stage.mockResolvedValue({ success: false, error: 'EACCES' })],
      [
        'resetting fails',
        () => service.reset.mockResolvedValue({ success: false, error: 'EACCES' }),
      ],
      [
        'publishing fails',
        () => service.publish.mockResolvedValue({ success: false, error: 'GitHub responded 422' }),
      ],
    ])('stays quiet when %s', async (_name, arrange) => {
      arrange()

      await invoke(GIST_CHANNELS.stage, 'abc123', 'notes.md', { status: 'deleted' })
      await invoke(GIST_CHANNELS.reset, 'abc123')
      await invoke(GIST_CHANNELS.publish, 'abc123')

      // Two of the three still succeed; the failing one must not announce.
      expect(send).toHaveBeenCalledTimes(2)
    })

    it('says nothing when a rename fails', async () => {
      service.renameFile.mockResolvedValue({ success: false, error: 'EACCES' })

      await invoke(GIST_CHANNELS.renameFile, 'abc123', 'notes.md', 'renamed.md', '# notes')
      expect(send).not.toHaveBeenCalled()
    })

    it('says nothing when the reset was cancelled', async () => {
      answerReset(false)
      await invoke(GIST_CHANNELS.reset, 'abc123')

      expect(send).not.toHaveBeenCalled()
    })
  })
})
