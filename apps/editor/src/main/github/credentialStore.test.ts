import type { CredentialStore } from './credentialStore'

const FILE = 'C:\\userData\\github-credentials.bin'
const CREDENTIALS = { login: 'soroushm', token: 'gho_token', avatar: 'data:image/png;base64,AQID' }
const CIPHERTEXT = Buffer.from('encrypted')

// Only the async safeStorage API is mocked — a call to the synchronous pair
// would be undefined here, so this doubles as a guard against reintroducing it.
const { safeStorage } = vi.hoisted(() => ({
  safeStorage: {
    isAsyncEncryptionAvailable: vi.fn(),
    encryptStringAsync: vi.fn(),
    decryptStringAsync: vi.fn(),
  },
}))

vi.mock('electron', () => ({ safeStorage }))

const { createCredentialStore } = await import('./credentialStore')

const io = {
  readFile: vi.fn(),
  writeFile: vi.fn().mockResolvedValue(undefined),
  rm: vi.fn().mockResolvedValue(undefined),
}

let store: CredentialStore

beforeEach(() => {
  vi.clearAllMocks()
  safeStorage.isAsyncEncryptionAvailable.mockResolvedValue(true)
  safeStorage.encryptStringAsync.mockResolvedValue(CIPHERTEXT)
  io.writeFile.mockResolvedValue(undefined)
  io.rm.mockResolvedValue(undefined)
  store = createCredentialStore(FILE, io)
})

describe('credentialStore.write', () => {
  it('writes only ciphertext, never the token itself', async () => {
    await expect(store.write(CREDENTIALS)).resolves.toEqual({ success: true, data: null })

    expect(safeStorage.encryptStringAsync).toHaveBeenCalledWith(JSON.stringify(CREDENTIALS))
    expect(io.writeFile).toHaveBeenCalledWith(FILE, CIPHERTEXT)
    // The plaintext token must never appear in what reaches disk.
    const [, written] = io.writeFile.mock.calls[0] as [string, Buffer]
    expect(written.toString()).not.toContain('gho_token')
  })

  it('refuses to store anything when the OS offers no encryption', async () => {
    safeStorage.isAsyncEncryptionAvailable.mockResolvedValue(false)

    await expect(store.write(CREDENTIALS)).resolves.toEqual({
      success: false,
      error: 'This system has no secure storage for a GitHub token',
    })
    expect(io.writeFile).not.toHaveBeenCalled()
  })

  it('reports a failed write', async () => {
    io.writeFile.mockRejectedValue(new Error('EACCES'))
    await expect(store.write(CREDENTIALS)).resolves.toEqual({ success: false, error: 'EACCES' })
  })
})

describe('credentialStore.read', () => {
  it('decrypts the stored credentials', async () => {
    io.readFile.mockResolvedValue(CIPHERTEXT)
    safeStorage.decryptStringAsync.mockResolvedValue({
      shouldReEncrypt: false,
      result: JSON.stringify(CREDENTIALS),
    })

    await expect(store.read()).resolves.toEqual(CREDENTIALS)
    expect(io.writeFile).not.toHaveBeenCalled()
  })

  it('rewrites the file under the new key after a rotation', async () => {
    io.readFile.mockResolvedValue(CIPHERTEXT)
    safeStorage.decryptStringAsync.mockResolvedValue({
      shouldReEncrypt: true,
      result: JSON.stringify(CREDENTIALS),
    })

    await expect(store.read()).resolves.toEqual(CREDENTIALS)
    expect(io.writeFile).toHaveBeenCalledWith(FILE, CIPHERTEXT)
  })

  it('reads as signed out when there is no file', async () => {
    io.readFile.mockRejectedValue(new Error('ENOENT'))
    await expect(store.read()).resolves.toBeNull()
  })

  it('reads as signed out when the file will not decrypt', async () => {
    io.readFile.mockResolvedValue(CIPHERTEXT)
    safeStorage.decryptStringAsync.mockRejectedValue(new Error('bad key'))
    await expect(store.read()).resolves.toBeNull()
  })

  it.each([
    ['unparseable contents', 'not json'],
    ['a payload missing the token', JSON.stringify({ login: 'soroushm' })],
  ])('reads as signed out on %s', async (_name, result) => {
    io.readFile.mockResolvedValue(CIPHERTEXT)
    safeStorage.decryptStringAsync.mockResolvedValue({ shouldReEncrypt: false, result })
    await expect(store.read()).resolves.toBeNull()
  })

  it('normalises a credential file written before avatars were stored', async () => {
    io.readFile.mockResolvedValue(CIPHERTEXT)
    safeStorage.decryptStringAsync.mockResolvedValue({
      shouldReEncrypt: false,
      result: JSON.stringify({ login: 'soroushm', token: 'gho_token' }),
    })

    await expect(store.read()).resolves.toEqual({
      login: 'soroushm',
      token: 'gho_token',
      avatar: null,
    })
  })
})

describe('credentialStore.clear', () => {
  it('removes the file', async () => {
    await expect(store.clear()).resolves.toEqual({ success: true, data: null })
    expect(io.rm).toHaveBeenCalledWith(FILE, { force: true })
  })

  it('reports a failed removal, stringifying a non-Error', async () => {
    io.rm.mockRejectedValue('locked')
    await expect(store.clear()).resolves.toEqual({ success: false, error: 'locked' })
  })
})
