import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ResolvedConfig } from 'vite'
import sitemap from './index'

const { readdirSyncMock, readFileSyncMock, writeFileSyncMock } = vi.hoisted(() => ({
  readdirSyncMock: vi.fn(),
  readFileSyncMock: vi.fn(),
  writeFileSyncMock: vi.fn(),
}))
vi.mock('node:fs', () => ({
  readdirSync: readdirSyncMock,
  readFileSync: readFileSyncMock,
  writeFileSync: writeFileSyncMock,
}))

const ROOT = resolve('/project')
const CLIENT = resolve(ROOT, 'build/client')

// `robots` meta is written name-first (covers the first regex alternative);
// `article:modified_time` is written content-first (covers the second).
const PAGES: Record<string, string> = {
  'index.html': '<html><head></head></html>',
  'about/index.html': '<meta content="2024-03-04T10:00:00Z" property="article:modified_time">',
  'projects/index.html': '<meta name="robots" content="noindex, nofollow">',
  'assets/app.js': 'console.log("ignored")',
}

const mockFs = () => {
  readdirSyncMock.mockReturnValue(Object.keys(PAGES))
  readFileSyncMock.mockImplementation((path: string) => {
    const relative = path
      .slice(resolve(CLIENT).length + 1)
      .split('\\')
      .join('/')
    return PAGES[relative]
  })
}

const run = (plugin: ReturnType<typeof sitemap>) => {
  ;(plugin.configResolved as (config: Pick<ResolvedConfig, 'root'>) => void)({ root: ROOT })
  const closeBundle = plugin.closeBundle as { handler: () => void }
  closeBundle.handler()
}

beforeEach(() => {
  readdirSyncMock.mockReset()
  readFileSyncMock.mockReset()
  writeFileSyncMock.mockReset()
  vi.spyOn(console, 'log').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('sitemap', () => {
  it('is a build-only plugin', () => {
    const plugin = sitemap()
    expect(plugin.name).toBe('vite-plugin-sitemap')
    expect(plugin.apply).toBe('build')
  })

  it('is an inert no-op when disabled', () => {
    const plugin = sitemap({ enable: false })
    expect(plugin.name).toBe('vite-plugin-sitemap')
    // No hooks registered — nothing to run, nothing to scan.
    expect(plugin.apply).toBeUndefined()
    expect(plugin.closeBundle).toBeUndefined()
  })

  it('writes a sitemap of indexable pages, skipping noindex and non-html files', () => {
    mockFs()
    run(sitemap())

    expect(writeFileSyncMock).toHaveBeenCalledOnce()
    const [target, xml] = writeFileSyncMock.mock.calls[0] as [string, string]
    expect(target).toBe(resolve(CLIENT, 'sitemap.xml'))
    // index.html -> '/', about has a lastmod, projects is noindex, app.js is not html.
    expect(xml).toContain('<url><loc>https://soroush.tech/</loc></url>')
    expect(xml).toContain(
      '<url><loc>https://soroush.tech/about/</loc><lastmod>2024-03-04</lastmod></url>'
    )
    expect(xml).not.toContain('/projects')
    expect(xml).not.toContain('app.js')
    expect(console.log).toHaveBeenCalledOnce()
  })

  it('writes nothing when there are no indexable pages', () => {
    readdirSyncMock.mockReturnValue(['assets/app.js'])
    readFileSyncMock.mockReturnValue('')
    run(sitemap())

    expect(writeFileSyncMock).not.toHaveBeenCalled()
    expect(console.log).not.toHaveBeenCalled()
  })

  it('honours the VITE_SITE_URL override', async () => {
    vi.stubEnv('VITE_SITE_URL', 'https://example.com')
    vi.resetModules()
    const { default: scopedSitemap } = await import('./index')

    mockFs()
    run(scopedSitemap())

    const [, xml] = writeFileSyncMock.mock.calls[0] as [string, string]
    expect(xml).toContain('<loc>https://example.com/</loc>')
  })
})
